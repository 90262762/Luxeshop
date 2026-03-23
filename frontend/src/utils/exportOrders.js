import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportOrdersToCSV = (orders) => {
  const data = orders.map(o => ({
    'Order ID':       `#${o._id.slice(-8).toUpperCase()}`,
    'Customer':       o.user?.name || 'N/A',
    'Email':          o.user?.email || 'N/A',
    'Items':          o.orderItems.map(i => `${i.name} x${i.qty}`).join(', '),
    'Subtotal':       o.itemsPrice,
    'Shipping':       o.shippingPrice,
    'Tax':            o.taxPrice,
    'Discount':       o.couponDiscount || 0,
    'Total':          o.totalPrice,
    'Payment Method': o.paymentMethod,
    'Paid':           o.isPaid ? 'Yes' : 'No',
    'Status':         o.status,
    'City':           o.shippingAddress?.city || '',
    'State':          o.shippingAddress?.state || '',
    'Date':           new Date(o.createdAt).toLocaleDateString('en-IN'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 14 }, { wch: 18 }, { wch: 24 }, { wch: 40 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 16 }, { wch: 6  }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 12 },
  ];

  const wb   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');

  const buf  = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  saveAs(blob, `LuxeShop-Orders-${new Date().toISOString().slice(0,10)}.xlsx`);
};