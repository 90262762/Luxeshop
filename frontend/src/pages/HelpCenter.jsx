import React, { useState } from 'react';
import './HelpCenter.css';

const faqs = [
  {
    category: 'Orders',
    icon: '📦',
    items: [
      { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive an email with a tracking link. You can also visit My Orders in your account to see live tracking updates.' },
      { q: 'Can I modify or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and cannot be changed. Contact our support team immediately if you need help.' },
      { q: 'What if I receive a wrong item?', a: 'We\'re sorry for the inconvenience! Please take a photo of the wrong item and contact us within 48 hours. We\'ll arrange a free pickup and send the correct item immediately.' },
    ],
  },
  {
    category: 'Payments',
    icon: '💳',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept UPI, Credit/Debit Cards (Visa, Mastercard, Rupay), Net Banking, Wallets (Paytm, PhonePe, Google Pay), and Cash on Delivery for eligible orders.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. All payments are processed through Razorpay with 256-bit SSL encryption. We never store your card details on our servers.' },
      { q: 'When will my refund be credited?', a: 'Refunds are processed within 2 business days of approval. It takes 5–7 business days to reflect in your account depending on your bank.' },
    ],
  },
  {
    category: 'Shipping',
    icon: '🚚',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 4–7 business days. Express delivery (available in select cities) takes 1–2 business days. Free shipping on orders above ₹999.' },
      { q: 'Do you deliver outside India?', a: 'Currently we only deliver within India. International shipping is coming soon — join our waitlist to be notified when it launches.' },
      { q: 'What happens if I miss my delivery?', a: 'Our delivery partner will attempt delivery 3 times. After that, the package is held at the nearest hub for 7 days before being returned to us.' },
    ],
  },
  {
    category: 'Account',
    icon: '👤',
    items: [
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page. Enter your registered email and we\'ll send a reset link valid for 15 minutes.' },
      { q: 'Can I have multiple addresses?', a: 'Yes! You can save up to 5 delivery addresses in your profile. You can set a default address and switch between them at checkout.' },
      { q: 'How do I delete my account?', a: 'We\'re sad to see you go! You can request account deletion from your Profile settings. All your data will be permanently removed within 30 days.' },
    ],
  },
];

const HelpCenter = () => {
  const [openItem, setOpenItem]   = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch]       = useState('');

  const filteredFaqs = search.trim()
    ? faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.items.length > 0)
    : faqs;

  const toggle = (key) => setOpenItem(openItem === key ? null : key);

  return (
    <div className="hc-page">

      {/* Hero */}
      <div className="hc-hero">
        <div className="hc-hero-bg" />
        <div className="hc-hero-content">
          <span className="hc-hero-eyebrow">Support</span>
          <h1 className="hc-hero-title">How can we help you?</h1>
          <p className="hc-hero-sub">Search our knowledge base or browse categories below</p>
          <div className="hc-search-wrap">
            <span className="hc-search-icon">🔍</span>
            <input
              className="hc-search"
              type="text"
              placeholder="Search for answers..."
              value={search}
              onChange={e => { setSearch(e.target.value); }}
            />
            {search && (
              <button className="hc-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="hc-quick">
        <div className="hc-container">
          <div className="hc-quick-grid">
            {[
              { icon: '📦', label: 'Track Order',    link: '/orders' },
              { icon: '↩️', label: 'Return Item',    link: '/return-policy' },
              { icon: '💬', label: 'Live Chat',      link: '/contact' },
              { icon: '📧', label: 'Email Support',  link: '/contact' },
            ].map(item => (
              <a key={item.label} href={item.link} className="hc-quick-card">
                <span className="hc-quick-icon">{item.icon}</span>
                <span className="hc-quick-label">{item.label}</span>
                <span className="hc-quick-arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="hc-faqs">
        <div className="hc-container">
          <h2 className="hc-section-title">Frequently Asked Questions</h2>

          {!search && (
            <div className="hc-tabs">
              {faqs.map((cat, i) => (
                <button
                  key={cat.category}
                  className={`hc-tab ${activeTab === i ? 'active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  <span>{cat.icon}</span> {cat.category}
                </button>
              ))}
            </div>
          )}

          <div className="hc-faq-list">
            {(search ? filteredFaqs : [filteredFaqs[activeTab]]).map((cat, ci) =>
              cat?.items.map((item, ii) => {
                const key = `${ci}-${ii}`;
                return (
                  <div
                    key={key}
                    className={`hc-faq-item ${openItem === key ? 'open' : ''}`}
                  >
                    <button className="hc-faq-q" onClick={() => toggle(key)}>
                      <span>{item.q}</span>
                      <span className="hc-faq-chevron">{openItem === key ? '−' : '+'}</span>
                    </button>
                    {openItem === key && (
                      <div className="hc-faq-a">{item.a}</div>
                    )}
                  </div>
                );
              })
            )}
            {filteredFaqs.length === 0 && (
              <div className="hc-no-results">
                <p>No results found for "<strong>{search}</strong>"</p>
                <span>Try different keywords or <a href="/contact">contact us</a></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Still need help */}
      <div className="hc-cta">
        <div className="hc-container">
          <div className="hc-cta-box">
            <h3>Still need help?</h3>
            <p>Our support team is available Mon–Sat, 9am–6pm IST</p>
            <div className="hc-cta-btns">
              <a href="/contact" className="hc-btn-primary">Contact Support</a>
              <a href="tel:+919876543210" className="hc-btn-outline">📞 Call Us</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HelpCenter;