const express  = require('express');
const router   = express.Router();
const Order    = require('../models/Order');
const User     = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const {
  sendOrderConfirmationEmail,
  sendStatusUpdateEmail,
} = require('../utils/orderEmail');

const STATUS_MESSAGES = {
  pending:    'Order placed and waiting to be processed',
  processing: 'Order confirmed and being prepared',
  shipped:    'Order has been shipped and is on the way',
  delivered:  'Order delivered successfully',
  cancelled:  'Order has been cancelled',
};

// POST /api/orders — create order
router.post('/', protect, async (req, res) => {
  const {
    orderItems, shippingAddress, paymentMethod,
    itemsPrice, shippingPrice, taxPrice, totalPrice,
    couponCode, couponDiscount,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    const order = new Order({
      user: req.user._id,
      orderItems, shippingAddress, paymentMethod,
      itemsPrice, shippingPrice, taxPrice, totalPrice,
      couponCode:     couponCode     || null,
      couponDiscount: couponDiscount || 0,
    });

    const created = await order.save();
    // ✅ Reduce stock for each ordered item
try {
  const Product = require('../models/Product');
  for (const item of created.orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { countInStock: -item.qty } }
    );
  }
  console.log('✅ Stock reduced for', created.orderItems.length, 'items');
} catch (stockErr) {
  console.error('❌ Stock reduce failed:', stockErr.message);
}

    // Add initial tracking history
    created.trackingHistory = [{
      status:    'pending',
      message:   'Order placed successfully',
      timestamp: new Date(),
    }];
    await created.save();

    // ✅ Notification — INSIDE async function
    try {
      await Notification.create({
        user:    req.user._id,
        title:   'Order Placed Successfully! 🎉',
        message: `Your order #${created._id.toString().slice(-6).toUpperCase()} has been placed.`,
        type:    'order',
        link:    `/orders/${created._id}`,
      });
    } catch (notifErr) {
      console.error('❌ Notification failed:', notifErr.message);
    }

    // Send confirmation email
    try {
      const user = await User.findById(req.user._id);
      await sendOrderConfirmationEmail(created, user);
      console.log('✅ Order confirmation email sent to:', user.email);
    } catch (emailErr) {
      console.error('❌ Email send failed:', emailErr.message);
    }

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders (admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/pay
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid   = true;
    order.paidAt   = Date.now();
    order.status   = 'processing';
    order.paymentResult = {
      id:            req.body.id,
      status:        req.body.status,
      update_time:   req.body.update_time,
      email_address: req.body.email_address,
    };

    if (!order.trackingHistory) order.trackingHistory = [];
    order.trackingHistory.push({
      status:    'processing',
      message:   STATUS_MESSAGES['processing'],
      timestamp: new Date(),
    });

    const updated = await order.save();

    // Notification
    try {
      await Notification.create({
        user:    order.user,
        title:   'Payment Confirmed! 💳',
        message: `Payment for order #${order._id.toString().slice(-6).toUpperCase()} confirmed.`,
        type:    'order',
        link:    `/orders/${order._id}`,
      });
    } catch (notifErr) {
      console.error('❌ Notification failed:', notifErr.message);
    }

    // Send confirmation email after payment
    try {
      const user = await User.findById(order.user);
      await sendOrderConfirmationEmail(updated, user);
      console.log('✅ Payment confirmation email sent to:', user.email);
    } catch (emailErr) {
      console.error('❌ Email after pay failed:', emailErr.message);
    }

    res.json(updated);
  } catch (err) {
    console.error('Pay order error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.status;
    order.status     = req.body.status;

    if (req.body.status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (!order.trackingHistory) order.trackingHistory = [];
    order.trackingHistory.push({
      status:    req.body.status,
      message:   STATUS_MESSAGES[req.body.status] || `Status updated to ${req.body.status}`,
      timestamp: new Date(),
    });

    const updated = await order.save();

    // ✅ Notification — INSIDE async function
    try {
      await Notification.create({
        user:    order.user,
        title:   `Order ${req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1)} 📦`,
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${req.body.status}.`,
        type:    'order',
        link:    `/orders/${order._id}`,
      });
    } catch (notifErr) {
      console.error('❌ Notification failed:', notifErr.message);
    }

    // Send status email
    if (prevStatus !== req.body.status) {
      try {
        const user = await User.findById(order.user);
        await sendStatusUpdateEmail(updated, user);
        console.log(`✅ Status email sent: ${prevStatus} → ${req.body.status}`);
      } catch (emailErr) {
        console.error('❌ Status email failed:', emailErr.message);
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel order with status "${order.status}".`,
      });
    }

    order.status = 'cancelled';

    if (!order.trackingHistory) order.trackingHistory = [];
    order.trackingHistory.push({
      status:    'cancelled',
      message:   STATUS_MESSAGES['cancelled'],
      timestamp: new Date(),
    });

    const updated = await order.save();

    // ✅ Restore stock when cancelled
try {
  const Product = require('../models/Product');
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { countInStock: item.qty } }
    );
  }
  console.log('✅ Stock restored for cancelled order');
} catch (stockErr) {
  console.error('❌ Stock restore failed:', stockErr.message);
}

    // Notification
    try {
      await Notification.create({
        user:    req.user._id,
        title:   'Order Cancelled',
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled.`,
        type:    'order',
        link:    `/orders/${order._id}`,
      });
    } catch (notifErr) {
      console.error('❌ Notification failed:', notifErr.message);
    }

    // Send cancellation email
    try {
      const user = await User.findById(req.user._id);
      await sendStatusUpdateEmail(updated, user);
      console.log('✅ Cancellation email sent:', user.email);
    } catch (emailErr) {
      console.error('❌ Cancel email failed:', emailErr.message);
    }

    res.json({ message: 'Order cancelled successfully', order: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/return
router.put('/:id/return', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }
    if (order.returnRequested) {
      return res.status(400).json({ message: 'Return already requested' });
    }

    order.returnRequested   = true;
    order.returnReason      = req.body.reason || 'No reason provided';
    order.returnStatus      = 'requested';
    order.returnRequestedAt = new Date();

    const updated = await order.save();

    try {
      const user = await User.findById(req.user._id);
      console.log(`📦 Return requested by ${user.email} for order ${order._id.toString().slice(-6)}`);
    } catch {}

    res.json({ message: 'Return request submitted successfully', order: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/return-status (admin)
router.put('/:id/return-status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.returnStatus = req.body.returnStatus;
    if (req.body.returnStatus === 'approved') {
      order.status = 'cancelled';
    }

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;