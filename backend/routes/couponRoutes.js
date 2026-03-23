const express     = require('express');
const router      = express.Router();
const Coupon      = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/coupons/apply — validate and apply coupon
router.post('/apply', protect, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    }
    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue.toLocaleString()}`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round(orderTotal * (coupon.discountValue / 100));
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.discountValue, orderTotal);
    }

    res.json({
      valid:         true,
      code:          coupon.code,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      message: coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% off applied! You save ₹${discount.toLocaleString()}`
        : `₹${discount.toLocaleString()} off applied!`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/coupons/use — increment usage count after order placed
router.post('/use', protect, async (req, res) => {
  try {
    const { code } = req.body;
    await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );
    res.json({ message: 'Coupon usage recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin routes ──────────────────────────────────────────────────

// GET /api/coupons — get all coupons
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/coupons — create coupon
router.post('/', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase().trim(),
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/coupons/:id — update coupon
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/coupons/:id — delete coupon
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;