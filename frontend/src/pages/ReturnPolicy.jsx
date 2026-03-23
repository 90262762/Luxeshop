import React, { useState } from 'react';
import './ReturnPolicy.css';

const sections = [
  {
    id: 'eligibility',
    icon: '✅',
    title: 'Return Eligibility',
    content: [
      { type: 'text', value: 'We want you to love every purchase. If you\'re not completely satisfied, you can return most items within 30 days of delivery.' },
      {
        type: 'list',
        label: 'Items eligible for return:',
        items: [
          'Unused and unworn items in original condition',
          'Items with all original tags and packaging intact',
          'Products received in damaged or defective condition',
          'Wrong item delivered by us',
        ],
      },
      {
        type: 'list',
        label: 'Items NOT eligible for return:',
        variant: 'danger',
        items: [
          'Innerwear, lingerie, and swimwear (hygiene reasons)',
          'Perishable goods and consumables',
          'Customised or personalised products',
          'Items marked "Final Sale" or "Non-Returnable"',
          'Digital products and gift cards',
        ],
      },
    ],
  },
  {
    id: 'process',
    icon: '📋',
    title: 'How to Initiate a Return',
    content: [
      { type: 'text', value: 'Returning an item is simple. Follow these steps and we\'ll handle the rest.' },
      {
        type: 'steps',
        items: [
          { step: '01', title: 'Go to My Orders', desc: 'Log in to your account and navigate to My Orders.' },
          { step: '02', title: 'Select the item', desc: 'Find the order and click "Return Item" next to the product.' },
          { step: '03', title: 'Choose reason', desc: 'Select a reason for return and upload photos if the item is damaged.' },
          { step: '04', title: 'Schedule pickup', desc: 'Choose a convenient pickup date and we\'ll arrange a free collection.' },
          { step: '05', title: 'Receive refund', desc: 'Once we inspect the item, your refund will be processed within 2 business days.' },
        ],
      },
    ],
  },
  {
    id: 'refunds',
    icon: '💰',
    title: 'Refund Policy',
    content: [
      { type: 'text', value: 'Refunds are processed after we receive and inspect the returned item.' },
      {
        type: 'table',
        headers: ['Payment Method', 'Refund Destination', 'Time'],
        rows: [
          ['Credit / Debit Card', 'Original card', '5–7 business days'],
          ['UPI / Net Banking', 'Original account', '3–5 business days'],
          ['Wallet (Paytm etc.)', 'Source wallet', '1–2 business days'],
          ['Cash on Delivery', 'Bank transfer', '5–7 business days'],
          ['LuxeShop Credits', 'Account credits', 'Instant'],
        ],
      },
      { type: 'note', value: '⚠️ Shipping charges are non-refundable unless the return is due to our error or a defective product.' },
    ],
  },
  {
    id: 'exchange',
    icon: '🔄',
    title: 'Exchanges',
    content: [
      { type: 'text', value: 'We offer free exchanges for size, colour, or a different variant of the same product.' },
      {
        type: 'list',
        label: 'Exchange conditions:',
        items: [
          'Exchange must be requested within 30 days of delivery',
          'Item must be unused and in original packaging',
          'Exchange is subject to stock availability',
          'One exchange allowed per order item',
        ],
      },
      { type: 'text', value: 'If the exchanged item has a different price, the difference will be charged or refunded accordingly.' },
    ],
  },
  {
    id: 'damaged',
    icon: '📸',
    title: 'Damaged or Defective Items',
    content: [
      { type: 'text', value: 'If you receive a damaged, defective, or wrong item, we sincerely apologise. Please:' },
      {
        type: 'list',
        items: [
          'Do NOT use or wash the item',
          'Take clear photos of the damage and the packaging',
          'Contact us within 48 hours of delivery',
          'We\'ll arrange immediate pickup and replacement at no cost',
        ],
      },
      { type: 'note', value: '💡 Tip: Always record an unboxing video for high-value orders. This speeds up the resolution process significantly.' },
    ],
  },
];

const ReturnPolicy = () => {
  const [active, setActive] = useState('eligibility');

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderContent = (content) =>
    content.map((block, i) => {
      if (block.type === 'text') return <p key={i} className="rp-text">{block.value}</p>;
      if (block.type === 'note') return <div key={i} className="rp-note">{block.value}</div>;
      if (block.type === 'list') return (
        <div key={i} className="rp-list-wrap">
          {block.label && <div className={`rp-list-label ${block.variant || ''}`}>{block.label}</div>}
          <ul className={`rp-list ${block.variant || ''}`}>
            {block.items.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        </div>
      );
      if (block.type === 'steps') return (
        <div key={i} className="rp-steps">
          {block.items.map((s, j) => (
            <div key={j} className="rp-step">
              <div className="rp-step-num">{s.step}</div>
              <div className="rp-step-body">
                <div className="rp-step-title">{s.title}</div>
                <div className="rp-step-desc">{s.desc}</div>
              </div>
              {j < block.items.length - 1 && <div className="rp-step-line" />}
            </div>
          ))}
        </div>
      );
      if (block.type === 'table') return (
        <div key={i} className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>{block.headers.map((h, j) => <th key={j}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j}>{row.map((cell, k) => <td key={k}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      return null;
    });

  return (
    <div className="rp-page">

      {/* Hero */}
      <div className="rp-hero">
        <div className="rp-hero-bg" />
        <div className="rp-hero-content">
          <span className="rp-eyebrow">Policies</span>
          <h1 className="rp-hero-title">Return & Refund Policy</h1>
          <p className="rp-hero-sub">Last updated: January 2025 · Easy 30-day returns</p>
        </div>
      </div>

      <div className="rp-layout">

        {/* Sidebar */}
        <aside className="rp-sidebar">
          <div className="rp-sidebar-inner">
            <div className="rp-sidebar-title">On this page</div>
            {sections.map(s => (
              <button
                key={s.id}
                className={`rp-sidebar-item ${active === s.id ? 'active' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                <span className="rp-sidebar-icon">{s.icon}</span>
                {s.title}
              </button>
            ))}
            <a href="/contact" className="rp-sidebar-help">
              Need help? Contact us →
            </a>
          </div>
        </aside>

        {/* Content */}
        <main className="rp-content">
          <div className="rp-intro">
            <p>At LuxeShop, your satisfaction is our priority. This policy outlines everything you need to know about returning products, getting refunds, and making exchanges. If you have any questions, our support team is always here to help.</p>
          </div>

          {sections.map(s => (
            <section key={s.id} id={s.id} className="rp-section">
              <div className="rp-section-head">
                <span className="rp-section-icon">{s.icon}</span>
                <h2 className="rp-section-title">{s.title}</h2>
              </div>
              <div className="rp-section-body">
                {renderContent(s.content)}
              </div>
            </section>
          ))}

          {/* Contact CTA */}
          <div className="rp-cta">
            <h3>Still have questions?</h3>
            <p>Our support team is available Mon–Sat, 9am–6pm IST</p>
            <div className="rp-cta-btns">
              <a href="/contact" className="rp-btn-primary">Contact Support</a>
              <a href="/help" className="rp-btn-outline">Visit Help Center</a>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default ReturnPolicy;