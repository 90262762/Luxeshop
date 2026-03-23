const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true },
  discountType:  { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount:   { type: Number, default: null }, // max cap for percentage
  usageLimit:    { type: Number, default: null }, // null = unlimited
  usedCount:     { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
  expiryDate:    { type: Date, default: null },   // null = never expires
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);