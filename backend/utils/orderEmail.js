const sendOrderConfirmationEmail = async (order, user) => {
  try {
    // Pre-build HTML rows for order items
    const itemsRows = order.orderItems.map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #f0ece5"><strong>${item.name}</strong></td>
        <td style="padding:10px;border-bottom:1px solid #f0ece5;text-align:center">${item.qty}</td>
        <td style="padding:10px;border-bottom:1px solid #f0ece5;text-align:right">₹${(item.price * item.qty).toLocaleString()}</td>
      </tr>
    `).join('');

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_ORDER_TEMPLATE_ID,
        user_id:     process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email:       user.email,
          user_name:      user.name,
          order_id:       order._id.toString().slice(-6).toUpperCase(),
          items_rows:     itemsRows,
          items_price:    `₹${order.itemsPrice?.toLocaleString()}`,
          shipping_price: order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`,
          total_price:    `₹${order.totalPrice?.toLocaleString()}`,
          order_link:     `https://luxeshop-lac.vercel.app/orders/${order._id}`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS Order error: ${errorText}`);
    }

    console.log('✅ Order confirmation email sent to:', user.email);
  } catch (err) {
    console.error('Order email error:', err.message);
  }
};

const sendStatusUpdateEmail = async (order, user) => {
  try {
    const STATUS_CONFIG = {
      processing: { icon: '⚙️', color: '#3498db', title: 'Order is Being Processed', message: 'Your order has been confirmed and is now being processed.' },
      shipped:    { icon: '🚚', color: '#9b59b6', title: 'Order Shipped!',            message: 'Your order is on its way!' },
      delivered:  { icon: '✅', color: '#27ae60', title: 'Order Delivered!',          message: 'Your order has been delivered. Enjoy your purchase!' },
      cancelled:  { icon: '❌', color: '#e74c3c', title: 'Order Cancelled',           message: 'Your order has been cancelled.' },
    };

    const config = STATUS_CONFIG[order.status] || {
      icon:    '📦',
      color:   '#1a1a2e',
      title:   'Order Status Updated',
      message: `Your order status has been updated to ${order.status}.`,
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_STATUS_TEMPLATE_ID,
        user_id:     process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email:       user.email,
          user_name:      user.name,
          order_id:       order._id.toString().slice(-6).toUpperCase(),
          total_price:    `₹${order.totalPrice?.toLocaleString()}`,
          status_icon:    config.icon,
          status_color:   config.color,
          status_title:   config.title,
          status_message: config.message,
          order_link:     `https://luxeshop-lac.vercel.app/orders/${order._id}`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS Status error: ${errorText}`);
    }

    console.log('✅ Status email sent to:', user.email);
  } catch (err) {
    console.error('Status email error:', err.message);
  }
};

module.exports = { sendOrderConfirmationEmail, sendStatusUpdateEmail };