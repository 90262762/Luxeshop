const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
  },
});

const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const transporter = createTransporter();
    const itemsHTML = order.orderItems.map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #f0ece5"><strong>${item.name}</strong></td>
        <td style="padding:10px;border-bottom:1px solid #f0ece5;text-align:center">${item.qty}</td>
        <td style="padding:10px;border-bottom:1px solid #f0ece5;text-align:right">₹${(item.price * item.qty).toLocaleString()}</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: `"LuxeShop" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmed! #${order._id.toString().slice(-6).toUpperCase()} — LuxeShop`,
      html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:0 auto;background:#f7f5f0;border-radius:16px;overflow:hidden">
        <div style="background:#1a1a2e;padding:28px 32px;text-align:center">
          <h1 style="color:white;font-size:22px;margin:0">◆ LUXE<span style="color:#e94560">SHOP</span></h1>
        </div>
        <div style="background:#27ae60;padding:20px 32px;text-align:center">
          <div style="font-size:2.5rem;margin-bottom:6px">🎉</div>
          <h2 style="color:white;margin:0;font-size:18px">Order Confirmed!</h2>
          <p style="color:rgba(255,255,255,.85);margin:4px 0 0;font-size:14px">Thank you for shopping with LuxeShop</p>
        </div>
        <div style="padding:28px 32px;background:white">
          <p style="color:#1a1a2e;font-size:16px;margin-bottom:6px">Hello <strong>${user.name}</strong> 👋</p>
          <p style="color:#6b6b8a;font-size:14px;margin-bottom:24px">Your order has been placed successfully.</p>
          <div style="background:#f7f5f0;border-radius:10px;padding:14px 18px;margin-bottom:20px">
            <span style="color:#6b6b8a;font-size:13px">Order ID</span>
            <strong style="color:#e94560;font-size:13px;float:right">#${order._id.toString().slice(-6).toUpperCase()}</strong>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <thead>
              <tr style="background:#1a1a2e">
                <th style="padding:10px;text-align:left;color:white;font-size:12px">Item</th>
                <th style="padding:10px;text-align:center;color:white;font-size:12px">Qty</th>
                <th style="padding:10px;text-align:right;color:white;font-size:12px">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>
          <div style="background:#f7f5f0;border-radius:10px;padding:16px 18px;margin-bottom:20px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#6b6b8a;font-size:13px">Subtotal</span>
              <span style="font-size:13px">₹${order.itemsPrice?.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#6b6b8a;font-size:13px">Shipping</span>
              <span style="font-size:13px">${order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
            </div>
            <div style="display:flex;justify-content:space-between;border-top:1px solid #e8e4dd;padding-top:10px">
              <strong style="font-size:15px">Total Paid</strong>
              <strong style="font-size:15px;color:#e94560">₹${order.totalPrice?.toLocaleString()}</strong>
            </div>
          </div>
          <div style="text-align:center">
            <a href="https://luxeshop-lac.vercel.app/orders/${order._id}"
              style="display:inline-block;background:#e94560;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
              Track Your Order →
            </a>
          </div>
        </div>
        <div style="background:#f0ece5;padding:16px 32px;text-align:center">
          <p style="color:#aaa;font-size:12px;margin:0">© 2025 LuxeShop. All rights reserved.</p>
        </div>
      </div>`,
    });
  } catch (err) {
    console.error('Order email error:', err.message);
  }
};

const sendStatusUpdateEmail = async (order, user) => {
  try {
    const transporter = createTransporter();
    const STATUS_CONFIG = {
      processing: { icon: '⚙️', color: '#3498db', title: 'Order is Being Processed', message: 'Your order has been confirmed and is now being processed.' },
      shipped:    { icon: '🚚', color: '#9b59b6', title: 'Order Shipped!',            message: 'Your order is on its way!' },
      delivered:  { icon: '✅', color: '#27ae60', title: 'Order Delivered!',          message: 'Your order has been delivered. Enjoy your purchase!' },
      cancelled:  { icon: '❌', color: '#e74c3c', title: 'Order Cancelled',           message: 'Your order has been cancelled.' },
    };

    const config = STATUS_CONFIG[order.status] || {
      icon: '📦', color: '#1a1a2e',
      title: 'Order Status Updated',
      message: `Your order status has been updated to ${order.status}.`,
    };

    await transporter.sendMail({
      from: `"LuxeShop" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `${config.icon} ${config.title} — Order #${order._id.toString().slice(-6).toUpperCase()}`,
      html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:0 auto;background:#f7f5f0;border-radius:16px;overflow:hidden">
        <div style="background:#1a1a2e;padding:24px 32px;text-align:center">
          <h1 style="color:white;font-size:20px;margin:0">◆ LUXE<span style="color:#e94560">SHOP</span></h1>
        </div>
        <div style="background:${config.color};padding:24px 32px;text-align:center">
          <div style="font-size:2.5rem;margin-bottom:8px">${config.icon}</div>
          <h2 style="color:white;margin:0;font-size:18px">${config.title}</h2>
        </div>
        <div style="padding:28px 32px;background:white">
          <p style="color:#1a1a2e;font-size:15px;margin-bottom:6px">Hello <strong>${user.name}</strong> 👋</p>
          <p style="color:#6b6b8a;font-size:14px;margin-bottom:24px">${config.message}</p>
          <div style="background:#f7f5f0;border-radius:10px;padding:14px 18px;margin-bottom:20px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#6b6b8a;font-size:13px">Order ID</span>
              <strong style="color:#e94560;font-size:13px">#${order._id.toString().slice(-6).toUpperCase()}</strong>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:#6b6b8a;font-size:13px">Total</span>
              <strong style="font-size:13px">₹${order.totalPrice?.toLocaleString()}</strong>
            </div>
          </div>
          <div style="text-align:center">
            <a href="https://luxeshop-lac.vercel.app/orders/${order._id}"
              style="display:inline-block;background:#e94560;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
              View Order Details →
            </a>
          </div>
        </div>
        <div style="background:#f0ece5;padding:14px 32px;text-align:center">
          <p style="color:#aaa;font-size:12px;margin:0">© 2025 LuxeShop. All rights reserved.</p>
        </div>
      </div>`,
    });
  } catch (err) {
    console.error('Status email error:', err.message);
  }
};

module.exports = { sendOrderConfirmationEmail, sendStatusUpdateEmail };