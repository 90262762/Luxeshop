import React, { useState } from 'react';
import axios from 'axios';
import './ContactUs.css';

const ContactUs = () => {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post('/api/contact', form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cu-page">

      {/* Hero */}
      <div className="cu-hero">
        <div className="cu-hero-bg" />
        <div className="cu-hero-content">
          <span className="cu-eyebrow">Get in Touch</span>
          <h1 className="cu-hero-title">Contact Us</h1>
          <p className="cu-hero-sub">We'd love to hear from you. We'll get back within 24 hours.</p>
        </div>
      </div>

      <div className="cu-container">
        <div className="cu-grid">

          {/* Left — contact info */}
          <div className="cu-info">
            <h2 className="cu-info-title">Reach out to us</h2>
            <p className="cu-info-sub">Our friendly team is always here to chat.</p>

            <div className="cu-channels">
              {[
                { icon: '📧', label: 'Email', value: 'support@luxeshop.in', link: 'mailto:support@luxeshop.in' },
                { icon: '📞', label: 'Phone', value: '+91 98765 43210', link: 'tel:+919876543210' },
                { icon: '💬', label: 'WhatsApp', value: '+91 98765 43210', link: 'https://wa.me/919876543210' },
                { icon: '📍', label: 'Office', value: '12 Commerce St, Mumbai, MH 400001', link: '#' },
              ].map(ch => (
                <a key={ch.label} href={ch.link} className="cu-channel-card">
                  <span className="cu-channel-icon">{ch.icon}</span>
                  <div>
                    <div className="cu-channel-label">{ch.label}</div>
                    <div className="cu-channel-value">{ch.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="cu-hours">
              <div className="cu-hours-title">Business Hours</div>
              <div className="cu-hours-row"><span>Monday – Friday</span><span>9:00 AM – 6:00 PM</span></div>
              <div className="cu-hours-row"><span>Saturday</span><span>10:00 AM – 4:00 PM</span></div>
              <div className="cu-hours-row muted"><span>Sunday</span><span>Closed</span></div>
            </div>
          </div>

          {/* Right — form */}
          <div className="cu-form-wrap">
            {sent ? (
              <div className="cu-success">
                <div className="cu-success-icon">✅</div>
                <h3>Message Sent!</h3>
                <p>Thanks for reaching out, <strong>{form.name}</strong>. We'll reply to <strong>{form.email}</strong> within 24 hours.</p>
                <button className="cu-btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className="cu-form" onSubmit={handleSubmit}>
                <h2 className="cu-form-title">Send a message</h2>

                {error && <div className="cu-error">{error}</div>}

                <div className="cu-form-row">
                  <div className="cu-form-group">
                    <label className="cu-label">Full Name *</label>
                    <input className="cu-input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                  </div>
                  <div className="cu-form-group">
                    <label className="cu-label">Email *</label>
                    <input className="cu-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                  </div>
                </div>

                <div className="cu-form-group">
                  <label className="cu-label">Subject *</label>
                  <select className="cu-input" name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">Select a subject</option>
                    <option value="Order Issue">Order Issue</option>
                    <option value="Payment Problem">Payment Problem</option>
                    <option value="Return/Refund">Return / Refund</option>
                    <option value="Product Query">Product Query</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="cu-form-group">
                  <label className="cu-label">Message *</label>
                  <textarea className="cu-input cu-textarea" name="message" value={form.message} onChange={handleChange} placeholder="Describe your issue or question in detail..." rows={5} required />
                </div>

                <button type="submit" className="cu-btn-primary" disabled={loading}>
                  {loading ? <span className="cu-spinner" /> : null}
                  {loading ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default ContactUs;