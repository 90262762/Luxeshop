const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (order, user) => {
  const itemsHTML = order.orderItems.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #f0ece5">
        <strong>${item.name}</strong>
      </td>
      <td style="padding:10px;border-bottom:1px solid #f0ece5;text-align:center">
        ${item.qty}
      </td>
      <td style="padding:10px;border-bottom:1px solid #f0ece5;text-align:right">
        ₹${(item.price * item.qty).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"LuxeShop" <${process.env.EMAIL_USER}>`,
    to:   user.email,
    subject: `Order Confirmed! #${order._id.toString().slice(-6).toUpperCase()} — LuxeShop`,
    html: `
    <div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:0 auto;background:#f7f5f0;border-radius:16px;overflow:hidden">

      <!-- Header -->
      <div style="background:#1a1a2e;padding:28px 32px;text-align:center">
        <h1 style="color:white;font-size:22px;margin:0;font-family:Georgia,serif">
          ◆ LUXE<span style="color:#e94560">SHOP</span>
        </h1>
      </div>

      <!-- Success banner -->
      <div style="background:#27ae60;padding:20px 32px;text-align:center">
        <div style="font-size:2.5rem;margin-bottom:6px">🎉</div>
        <h2 style="color:white;margin:0;font-size:18px">Order Confirmed!</h2>
        <p style="color:rgba(255,255,255,.85);margin:4px 0 0;font-size:14px">
          Thank you for shopping with LuxeShop
        </p>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;background:white">

        <p style="color:#1a1a2e;font-size:16px;margin-bottom:6px">
          Hello <strong>${user.name}</strong> 👋
        </p>
        <p style="color:#6b6b8a;font-size:14px;margin-bottom:24px">
          Your order has been placed successfully. Here's a summary:
        </p>

        <!-- Order ID -->
        <div style="background:#f7f5f0;border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;justify-content:space-between">
          <span style="color:#6b6b8a;font-size:13px">Order ID</span>
          <strong style="color:#e94560;font-size:13px">
            #${order._id.toString().slice(-6).toUpperCase()}
          </strong>
        </div>

        <!-- Items table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr style="background:#1a1a2e">
              <th style="padding:10px;text-align:left;color:white;font-size:12px;border-radius:8px 0 0 0">
                Item
              </th>
              <th style="padding:10px;text-align:center;color:white;font-size:12px">Qty</th>
              <th style="padding:10px;text-align:right;color:white;font-size:12px;border-radius:0 8px 0 0">
                Price
              </th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <!-- Price breakdown -->
        <div style="background:#f7f5f0;border-radius:10px;padding:16px 18px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#6b6b8a;font-size:13px">Subtotal</span>
            <span style="font-size:13px">₹${order.itemsPrice?.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#6b6b8a;font-size:13px">Shipping</span>
            <span style="font-size:13px;color:${order.shippingPrice === 0 ? '#27ae60' : '#1a1a2e'}">
              ${order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#6b6b8a;font-size:13px">GST (18%)</span>
            <span style="font-size:13px">₹${order.taxPrice?.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #e8e4dd;padding-top:10px;margin-top:4px">
            <strong style="font-size:15px">Total Paid</strong>
            <strong style="font-size:15px;color:#e94560">₹${order.totalPrice?.toLocaleString()}</strong>
          </div>
        </div>

        <!-- Shipping address -->
        <div style="margin-bottom:20px">
          <h3 style="font-size:13px;color:#6b6b8a;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">
            Shipping To
          </h3>
          <p style="color:#1a1a2e;font-size:14px;line-height:1.7;margin:0">
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.postalCode}<br>
            ${order.shippingAddress.country}<br>
            📞 ${order.shippingAddress.phone}
          </p>
        </div>

        <!-- Payment method -->
        <div style="background:#f7f5f0;border-radius:10px;padding:14px 18px;margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="color:#6b6b8a;font-size:13px">Payment Method</span>
            <span style="font-size:13px;font-weight:600">${order.paymentMethod}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <span style="color:#6b6b8a;font-size:13px">Payment Status</span>
            <span style="font-size:13px;font-weight:700;color:${order.isPaid ? '#27ae60' : '#f39c12'}">
              ${order.isPaid ? '✓ Paid' : '⏳ Pending'}
            </span>
          </div>
        </div>

        <!-- CTA button -->
        <div style="text-align:center">
          <a href="http://localhost:3000/orders/${order._id}"
            style="display:inline-block;background:#e94560;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
            Track Your Order →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f0ece5;padding:16px 32px;text-align:center">
        <p style="color:#aaa;font-size:12px;margin:0">
          © 2025 LuxeShop. All rights reserved.<br>
          If you have any questions, contact us at ${process.env.EMAIL_USER}
        </p>
      </div>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOrderConfirmationEmail };



const sendStatusUpdateEmail = async (order, user) => {

  const STATUS_CONFIG = {
    processing: {
      icon:    '⚙️',
      color:   '#3498db',
      title:   'Order is Being Processed',
      message: 'Great news! Your order has been confirmed and is now being processed.',
    },
    shipped: {
      icon:    '🚚',
      color:   '#9b59b6',
      title:   'Order Shipped!',
      message: 'Your order is on its way! It will be delivered to you soon.',
    },
    delivered: {
      icon:    '✅',
      color:   '#27ae60',
      title:   'Order Delivered!',
      message: 'Your order has been delivered successfully. Enjoy your purchase!',
    },
    cancelled: {
      icon:    '❌',
      color:   '#e74c3c',
      title:   'Order Cancelled',
      message: 'Your order has been cancelled. If you have any questions, please contact us.',
    },
  };

  const config = STATUS_CONFIG[order.status] || {
    icon:    '📦',
    color:   '#1a1a2e',
    title:   `Order Status Updated`,
    message: `Your order status has been updated to ${order.status}.`,
  };

  const itemsHTML = order.orderItems.map(item => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ece5;font-size:13px">
        ${item.name}
      </td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ece5;text-align:center;font-size:13px">
        ${item.qty}
      </td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ece5;text-align:right;font-size:13px">
        ₹${(item.price * item.qty).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from:    `"LuxeShop" <${process.env.EMAIL_USER}>`,
    to:      user.email,
    subject: `${config.icon} ${config.title} — Order #${order._id.toString().slice(-6).toUpperCase()}`,
    html: `
    <div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:0 auto;background:#f7f5f0;border-radius:16px;overflow:hidden">

      <!-- Header -->
      <div style="background:#1a1a2e;padding:24px 32px;text-align:center">
        <h1 style="color:white;font-size:20px;margin:0;font-family:Georgia,serif">
          ◆ LUXE<span style="color:#e94560">SHOP</span>
        </h1>
      </div>

      <!-- Status banner -->
      <div style="background:${config.color};padding:24px 32px;text-align:center">
        <div style="font-size:2.5rem;margin-bottom:8px">${config.icon}</div>
        <h2 style="color:white;margin:0;font-size:18px">${config.title}</h2>
      </div>

      <!-- Body -->
      <div style="padding:28px 32px;background:white">

        <p style="color:#1a1a2e;font-size:15px;margin-bottom:6px">
          Hello <strong>${user.name}</strong> 👋
        </p>
        <p style="color:#6b6b8a;font-size:14px;margin-bottom:24px">
          ${config.message}
        </p>

        <!-- Order info -->
        <div style="background:#f7f5f0;border-radius:10px;padding:14px 18px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#6b6b8a;font-size:13px">Order ID</span>
            <strong style="color:#e94560;font-size:13px">
              #${order._id.toString().slice(-6).toUpperCase()}
            </strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#6b6b8a;font-size:13px">Status</span>
            <span style="font-size:13px;font-weight:700;color:${config.color};text-transform:capitalize">
              ${order.status}
            </span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#6b6b8a;font-size:13px">Total</span>
            <strong style="font-size:13px">₹${order.totalPrice?.toLocaleString()}</strong>
          </div>
        </div>

        <!-- Status timeline -->
        <div style="margin-bottom:24px">
          <h3 style="font-size:13px;color:#6b6b8a;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">
            Order Progress
          </h3>
          <div style="display:flex;justify-content:space-between;position:relative">
            ${['pending','processing','shipped','delivered'].map((s, i) => {
              const statuses = ['pending','processing','shipped','delivered'];
              const currentIndex = statuses.indexOf(order.status);
              const isDone = i <= currentIndex;
              return `
              <div style="text-align:center;flex:1">
                <div style="width:28px;height:28px;border-radius:50%;background:${isDone ? config.color : '#e8e4dd'};color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-size:11px;font-weight:700">
                  ${isDone ? '✓' : i + 1}
                </div>
                <div style="font-size:10px;color:${isDone ? config.color : '#aaa'};font-weight:${isDone ? '700' : '400'};text-transform:capitalize">
                  ${s}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Items -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr style="background:#1a1a2e">
              <th style="padding:9px 10px;text-align:left;color:white;font-size:11px">Item</th>
              <th style="padding:9px 10px;text-align:center;color:white;font-size:11px">Qty</th>
              <th style="padding:9px 10px;text-align:right;color:white;font-size:11px">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <!-- Shipping address -->
        <div style="background:#f7f5f0;border-radius:10px;padding:14px 18px;margin-bottom:24px">
          <h3 style="font-size:12px;color:#6b6b8a;text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px">
            Shipping Address
          </h3>
          <p style="color:#1a1a2e;font-size:13px;line-height:1.7;margin:0">
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.address}, ${order.shippingAddress.city}<br>
            ${order.shippingAddress.state} — ${order.shippingAddress.postalCode}
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align:center">
          <a href="http://localhost:3000/orders/${order._id}"
            style="display:inline-block;background:#e94560;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
            View Order Details →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f0ece5;padding:14px 32px;text-align:center">
        <p style="color:#aaa;font-size:12px;margin:0">
          © 2025 LuxeShop. All rights reserved.
        </p>
      </div>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOrderConfirmationEmail, sendStatusUpdateEmail };