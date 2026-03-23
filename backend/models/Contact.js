const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, trim: true, lowercase: true },
  subject:   { type: String, required: true },
  message:   { type: String, required: true },
  status:    { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);