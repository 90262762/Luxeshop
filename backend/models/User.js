const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  avatar:        { type: String, default: '' },
avatarPublicId: { type: String, default: '' },
  otp:        { type: String,  default: null },
  otpExpiry:  { type: Date,    default: null },
  isVerified: { type: Boolean, default: false },
  address: {
   street:  { type: String, default: '' },
  city:    { type: String, default: '' },
  state:   { type: String, default: '' },
  zip:     { type: String, default: '' },
  country: { type: String, default: 'India' },
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
