const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// ── Email transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use Gmail App Password
  },
});

// ─────────────────────────────────────────
// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
// ─────────────────────────────────────────
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (message.length < 10) {
      return res.status(400).json({ message: 'Message must be at least 10 characters' });
    }

    // Save to DB
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send confirmation email to user
    try {
      await transporter.sendMail({
        from: `"LuxeShop Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `We received your message — ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 1.5rem;">
                ◆ <span style="color: #e94560;">LUXE</span>SHOP
              </h1>
            </div>
            <div style="background: #f7f5f0; padding: 2rem; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1a1a2e;">Hi ${name},</h2>
              <p style="color: #6b6b8a; line-height: 1.7;">
                Thanks for reaching out! We've received your message and our team will get back to you within <strong>24 hours</strong>.
              </p>
              <div style="background: white; border-radius: 8px; padding: 1.25rem; margin: 1.5rem 0; border-left: 3px solid #e94560;">
                <p style="margin: 0 0 0.5rem; font-weight: 700; color: #1a1a2e;">Your message:</p>
                <p style="margin: 0; color: #6b6b8a; font-style: italic;">"${message}"</p>
              </div>
              <p style="color: #9999b3; font-size: 0.875rem;">
                Reference ID: <strong>#${contact._id}</strong><br/>
                If you need urgent help, call us at <strong>+91 98765 43210</strong>
              </p>
            </div>
          </div>
        `,
      });

      // Notify admin
      await transporter.sendMail({
        from: `"LuxeShop Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `[New Contact] ${subject} — from ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #1a1a2e;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 0.5rem; font-weight: 700; color: #6b6b8a;">Name</td><td style="padding: 0.5rem;">${name}</td></tr>
              <tr style="background: #f7f5f0;"><td style="padding: 0.5rem; font-weight: 700; color: #6b6b8a;">Email</td><td style="padding: 0.5rem;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 0.5rem; font-weight: 700; color: #6b6b8a;">Subject</td><td style="padding: 0.5rem;">${subject}</td></tr>
              <tr style="background: #f7f5f0;"><td style="padding: 0.5rem; font-weight: 700; color: #6b6b8a;">Message</td><td style="padding: 0.5rem;">${message}</td></tr>
              <tr><td style="padding: 0.5rem; font-weight: 700; color: #6b6b8a;">IP</td><td style="padding: 0.5rem;">${req.ip}</td></tr>
            </table>
            <p style="margin-top: 1rem;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/admin" 
                 style="background: #e94560; color: white; padding: 0.6rem 1.25rem; border-radius: 8px; text-decoration: none; font-weight: 700;">
                View in Admin Panel
              </a>
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      // Email failure shouldn't break the submission
      console.error('Email send error:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been received. We\'ll get back to you within 24 hours.',
      referenceId: contact._id,
    });

  } catch (err) {
    console.error('Contact submit error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/contact
// @desc    Get all contact submissions (Admin)
// @access  Private/Admin
// ─────────────────────────────────────────
const getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const total    = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      contacts,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/contact/:id/status
// @desc    Update contact status (Admin)
// @access  Private/Admin
// ─────────────────────────────────────────
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/contact/:id
// @desc    Delete a contact submission (Admin)
// @access  Private/Admin
// ─────────────────────────────────────────
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