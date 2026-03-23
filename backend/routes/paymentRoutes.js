const express    = require('express');
const router     = express.Router();
const Razorpay   = require('razorpay');
const crypto     = require('crypto');
const Order      = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// Creates a Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount:   Math.round(amount * 100), // Razorpay needs paise
      currency,
      receipt:  `receipt_${orderId || Date.now()}`,
      notes: {
        orderId:  orderId || '',
        userId:   req.user._id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      id:       razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount:   razorpayOrder.amount,
    });
  } catch (err) {
    console.error('Razorpay order error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/verify
// Verifies payment signature after success
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Verify signature
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update order as paid
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid      = true;
    order.paidAt      = Date.now();
    order.status      = 'processing';
    order.paymentResult = {
      id:           razorpay_payment_id,
      status:       'completed',
      update_time:  Date.now().toString(),
      razorpay_order_id,
      razorpay_signature,
    };
    await order.save();

    res.json({ success: true, message: 'Payment verified!', order });
  } catch (err) {
    console.error('Payment verify error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/failed
// Mark order as failed
router.post('/failed', protect, async (req, res) => {
  try {
    const { orderId, error } = req.body;
    const order = await Order.findById(orderId);
    if (order) {
      order.status = 'pending';
      order.paymentResult = {
        id:          '',
        status:      'failed',
        update_time: Date.now().toString(),
      };
      await order.save();
    }
    res.json({ message: 'Payment failure recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;