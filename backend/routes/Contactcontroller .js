const Contact = require('../models/Contact');
const Mailjet = require('node-mailjet');

const client = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Save to DB
    const contact = await Contact.create({
      name, email, subject, message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send confirmation to user
    try {
      await client.post('send', { version: 'v3.1' }).request({
        Messages: [{
          From: { Email: process.env.EMAIL_FROM, Name: 'LuxeShop Support' },
          To:   [{ Email: email, Name: name }],
          Subject: `We received your message — ${subject}`,
          HTMLPart: `
            <div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:0 auto;background:#f7f5f0;border-radius:16px;overflow:hidden">
              <div style="background:#1a1a2e;padding:28px 32px;text-align:center">
                <h1 style="color:white;font-size:22px;margin:0">◆ LUXE<span style="color:#e94560">SHOP</span></h1>
              </div>
              <div style="padding:28px 32px;background:white">
                <h2 style="color:#1a1a2e;">Hi ${name},</h2>
                <p style="color:#6b6b8a;line-height:1.7;">Thanks for reaching out! We've received your message and will get back to you within <strong>24 hours</strong>.</p>
                <div style="background:#f7f5f0;border-radius:8px;padding:1.25rem;margin:1.5rem 0;border-left:3px solid #e94560;">
                  <p style="margin:0 0 0.5rem;font-weight:700;color:#1a1a2e;">Your message:</p>
                  <p style="margin:0;color:#6b6b8a;font-style:italic;">"${message}"</p>
                </div>
                <p style="color:#9999b3;font-size:0.875rem;">Reference ID: <strong>#${contact._id}</strong></p>
              </div>
              <div style="background:#f0ece5;padding:16px 32px;text-align:center">
                <p style="color:#aaa;font-size:12px;margin:0">© 2025 LuxeShop. All rights reserved.</p>
              </div>
            </div>
          `,
        }],
      });

      // Notify admin
      await client.post('send', { version: 'v3.1' }).request({
        Messages: [{
          From: { Email: process.env.EMAIL_FROM, Name: 'LuxeShop Contact Form' },
          To:   [{ Email: process.env.EMAIL_FROM, Name: 'Admin' }],
          Subject: `[New Contact] ${subject} — from ${name}`,
          HTMLPart: `
            <div style="font-family:sans-serif;max-width:600px;">
              <h2 style="color:#1a1a2e;">New Contact Form Submission</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:0.5rem;font-weight:700;color:#6b6b8a;">Name</td><td>${name}</td></tr>
                <tr style="background:#f7f5f0;"><td style="padding:0.5rem;font-weight:700;color:#6b6b8a;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding:0.5rem;font-weight:700;color:#6b6b8a;">Subject</td><td>${subject}</td></tr>
                <tr style="background:#f7f5f0;"><td style="padding:0.5rem;font-weight:700;color:#6b6b8a;">Message</td><td>${message}</td></tr>
              </table>
            </div>
          `,
        }],
      });
    } catch (emailErr) {
      console.error('Contact email error:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Your message has been received. We'll get back to you within 24 hours.",
      referenceId: contact._id,
    });

  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

const getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const total    = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ contacts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitContact, getContacts, updateContactStatus, deleteContact };