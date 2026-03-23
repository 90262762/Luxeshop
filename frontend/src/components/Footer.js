import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">

      {/* ── Top accent line ── */}
      <div className="footer-accent-line" />

      {/* ── Main footer body ── */}
      <div className="footer-body">
        <div className="footer-container">
          <div className="footer-grid">

            {/* ── Brand column ── */}
            <div className="footer-brand-col">
              <Link to="/" className="footer-logo">
                <span className="footer-logo-diamond">◆</span>
                <span className="footer-logo-text">
                  LUXE<span className="footer-logo-accent">SHOP</span>
                </span>
              </Link>
              <p className="footer-tagline">
                India's premium destination for curated fashion, electronics, and lifestyle products. Quality you can trust, delivered to your door.
              </p>

              {/* Contact info */}
              <div className="footer-contact">
                <a href="tel:+919876543210" className="footer-contact-item">
                  <span className="footer-contact-icon">📞</span>
                  <span>+91 98765 43210</span>
                </a>
                <a href="mailto:support@luxeshop.in" className="footer-contact-item">
                  <span className="footer-contact-icon">✉️</span>
                  <span>support@luxeshop.in</span>
                </a>
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">📍</span>
                  <span>12 Commerce St, Mumbai, MH 400001</span>
                </div>
              </div>

              {/* Social icons */}
              <div className="footer-socials">
                {[
                  { icon: '𝕏', label: 'Twitter',   href: '#' },
                  { icon: 'in', label: 'LinkedIn',  href: '#' },
                  { icon: 'f',  label: 'Facebook',  href: '#' },
                  { icon: '▶',  label: 'YouTube',   href: '#' },
                  { icon: '📸', label: 'Instagram', href: '#' },
                ].map(s => (
                  <a key={s.label} href={s.href} className="footer-social-btn" aria-label={s.label} target="_blank" rel="noreferrer">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* ── Links columns ── */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">Shop</h4>
              <ul className="footer-links">
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products?category=Electronics">Electronics</Link></li>
                <li><Link to="/products?category=Fashion">Fashion</Link></li>
                <li><Link to="/products?category=Home">Home & Living</Link></li>
                <li><Link to="/products?category=Sports">Sports</Link></li>
                <li><Link to="/products?category=Books">Books</Link></li>
                <li><Link to="/products?category=Beauty">Beauty</Link></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">Account</h4>
              <ul className="footer-links">
                <li><Link to="/profile">My Profile</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
                <li><Link to="/wishlist">Wishlist</Link></li>
                <li><Link to="/cart">Shopping Cart</Link></li>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Create Account</Link></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">Support</h4>
              <ul className="footer-links">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/return-policy">Return Policy</Link></li>
                <li><Link to="/return-policy#shipping">Shipping Info</Link></li>
                <li><Link to="/return-policy#refunds">Refund Policy</Link></li>
                <li><Link to="/return-policy#exchange">Exchanges</Link></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/press">Press</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/sitemap">Sitemap</Link></li>
              </ul>
            </div>

          </div>

          {/* ── Newsletter + Payment strip ── */}
          <div className="footer-middle">

            {/* Newsletter */}
            <div className="footer-newsletter">
              <div className="footer-newsletter-text">
                <h4>Stay in the loop</h4>
                <p>Get exclusive deals, new arrivals and style tips straight to your inbox.</p>
              </div>
              <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="footer-newsletter-input"
                />
                <button type="submit" className="footer-newsletter-btn">
                  {subscribed ? '✓ Subscribed!' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Payment methods */}
            <div className="footer-payments">
              <span className="footer-payments-label">Secure payments via</span>
              <div className="footer-payment-icons">
                {['VISA', 'MC', 'UPI', 'GPay', 'PhonePe', 'Paytm', 'COD'].map(p => (
                  <span key={p} className="footer-payment-badge">{p}</span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-inner">
            <p className="footer-copyright">
              © {currentYear} <strong>LuxeShop</strong>. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy</Link>
              <span>·</span>
              <Link to="/terms">Terms</Link>
              <span>·</span>
              <Link to="/sitemap">Sitemap</Link>
              <span>·</span>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-trust-badges">
              <span className="footer-trust-badge">🔒 SSL Secured</span>
              <span className="footer-trust-badge">✅ Verified Seller</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;