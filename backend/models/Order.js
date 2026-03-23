const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  qty: Number,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  trackingHistory: [
  {
    status:    { type: String },
    message:   { type: String },
    timestamp: { type: Date, default: Date.now },
  }
],
  paymentMethod: { type: String, default: 'Card' },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  itemsPrice: Number,
  shippingPrice: Number,
  taxPrice: Number,
  totalPrice: Number,
  returnRequested:  { type: Boolean, default: false },
returnReason:     { type: String,  default: ''    },
returnStatus:     { type: String,  enum: ['none', 'requested', 'approved', 'rejected'], default: 'none' },
returnRequestedAt:{ type: Date,    default: null  },
  couponCode:     { type: String, default: null },
  couponDiscount: { type: Number, default: 0    },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
