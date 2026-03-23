import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ───────────────────────────────────────────────────────
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LUXESHOP', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium E-Commerce', 14, 28);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 14, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${order._id.slice(-8).toUpperCase()}`, pageWidth - 14, 28, { align: 'right' });

  // ── Order Info ───────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  doc.setFont('helvetica', 'bold');
  doc.text('Order Details', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date:          ${orderDate}`,      14, 63);
  doc.text(`Payment:       ${order.paymentMethod}`, 14, 70);
  doc.text(`Status:        ${order.status}`,   14, 77);
  doc.text(`Paid:          ${order.isPaid ? 'Yes' : 'No'}`, 14, 84);

  // ── Shipping Address ─────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Ship To', pageWidth / 2 + 10, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const addr = order.shippingAddress;
  doc.text(addr.fullName,                              pageWidth / 2 + 10, 63);
  doc.text(addr.address,                               pageWidth / 2 + 10, 70);
  doc.text(`${addr.city}, ${addr.state} — ${addr.postalCode}`, pageWidth / 2 + 10, 77);
  doc.text(addr.country,                               pageWidth / 2 + 10, 84);
  doc.text(`Phone: ${addr.phone}`,                     pageWidth / 2 + 10, 91);

  // ── Items Table ──────────────────────────────────────────────────
  autoTable(doc, {
    startY: 100,
    head: [['#', 'Product', 'Qty', 'Unit Price', 'Total']],
    body: order.orderItems.map((item, i) => [
      i + 1,
      item.name,
      item.qty,
      `Rs. ${item.price.toLocaleString()}`,
      `Rs. ${(item.price * item.qty).toLocaleString()}`,
    ]),
    headStyles: {
      fillColor:  [26, 26, 46],
      textColor:  [255, 255, 255],
      fontStyle:  'bold',
      fontSize:   9,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [247, 245, 240] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
  });

  // ── Price Summary ────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 10;

  const summaryX = pageWidth - 80;
  doc.setDrawColor(230, 226, 221);
  doc.setLineWidth(0.5);
  doc.line(summaryX, finalY, pageWidth - 14, finalY);

  const rows = [
    ['Subtotal',                    `Rs. ${order.itemsPrice?.toLocaleString()}`],
    ['Shipping',                    order.shippingPrice === 0 ? 'FREE' : `Rs. ${order.shippingPrice}`],
    ['GST (18%)',                   `Rs. ${order.taxPrice?.toLocaleString()}`],
  ];

  if (order.couponDiscount > 0) {
    rows.push([`Discount (${order.couponCode})`, `- Rs. ${order.couponDiscount?.toLocaleString()}`]);
  }

  let y = finalY + 8;
  doc.setFontSize(9);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, summaryX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(value, pageWidth - 14, y, { align: 'right' });
    y += 7;
  });

  // Total
  y += 2;
  doc.setFillColor(26, 26, 46);
  doc.rect(summaryX - 2, y - 5, pageWidth - summaryX - 12, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', summaryX, y + 3);
  doc.text(`Rs. ${order.totalPrice?.toLocaleString()}`, pageWidth - 14, y + 3, { align: 'right' });

  // ── Footer ───────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(247, 245, 240);
  doc.rect(0, footerY - 5, pageWidth, 25, 'F');
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for shopping with LuxeShop!', pageWidth / 2, footerY + 2, { align: 'center' });
  doc.text('For support: support@luxeshop.com', pageWidth / 2, footerY + 8, { align: 'center' });

  // Save
  doc.save(`LuxeShop-Invoice-${order._id.slice(-8).toUpperCase()}.pdf`);
};