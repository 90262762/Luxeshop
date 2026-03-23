import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart }     from '../context/CartContext';
import { useAuth }     from '../context/AuthContext';
import API             from '../utils/api';
import { initiatePayment } from '../utils/razorpay';
import './Checkout.css';
import { useNotifications } from '../context/NotificationContext';
const STEPS = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user }    = useAuth();
  const navigate    = useNavigate();
const { fetchNotifications } = useNotifications();

  const [step,     setStep]    = useState(0);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');

  const [shipping, setShipping] = useState({
    fullName: user?.name || '', address: '', city: '',
    state: '', postalCode: '', country: 'India', phone: '',
  });
  const [payment, setPayment] = useState('Razorpay');

  // Coupon state
  const [couponCode,    setCouponCode]    = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError,   setCouponError]   = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const shippingFee = cartTotal > 999 ? 0 : 99;
  const tax         = Math.round(cartTotal * 0.18);
  const discount    = couponApplied?.discount || 0;
  const total       = cartTotal + shippingFee + tax - discount;

  const isShippingValid = () =>
    shipping.fullName && shipping.address && shipping.city &&
    shipping.state && shipping.postalCode && shipping.phone;

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return setCouponError('Enter a coupon code');
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    setCouponApplied(null);

    try {
      const { data } = await API.post('/coupons/apply', {
        code:       couponCode.trim(),
        orderTotal: cartTotal,
      });
      setCouponApplied(data);
      setCouponSuccess(data.message);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  // Place order
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: order } = await API.post('/orders', {
        orderItems: cartItems.map(i => ({
          product: i._id,
          name:    i.name,
          image:   i.images?.[0] || '',
          price:   i.price,
          qty:     i.qty,
        })),
        shippingAddress: shipping,
        paymentMethod:   payment,
        itemsPrice:      cartTotal,
        shippingPrice:   shippingFee,
        taxPrice:        tax,
        couponCode:      couponApplied?.code      || null,
        couponDiscount:  couponApplied?.discount  || 0,
        totalPrice:      total,
      });
       fetchNotifications();

      // Record coupon usage
      if (couponApplied?.code) {
        await API.post('/coupons/use', { code: couponApplied.code });
      }

      if (payment === 'Cash on Delivery') {
        clearCart();
        navigate(`/orders/${order._id}?success=true`);
        return;
      }

      await initiatePayment({
        amount:  total,
        orderId: order._id,
        user,
        onSuccess: () => {
          setLoading(false);
           fetchNotifications();
          clearCart();
          navigate(`/orders/${order._id}?success=true`);
        },
        onFailure: (msg) => {
          setLoading(false);
          setError(`Payment failed: ${msg}`);
        },
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Order failed');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">

        {/* Progress */}
        <div className="checkout-progress">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`progress-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            >
              <div className="step-num">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {/* Step 0 — Shipping */}
            {step === 0 && (
              <div className="checkout-section">
                <h2>Shipping Address</h2>
                <div className="form-row">
                  {[
                    ['fullName',   'Full Name',     'text'],
                    ['phone',      'Phone Number',  'tel'],
                    ['address',    'Street Address','text'],
                    ['city',       'City',          'text'],
                    ['state',      'State',         'text'],
                    ['postalCode', 'PIN Code',      'text'],
                  ].map(([field, label, type]) => (
                    <div
                      key={field}
                      className="form-group"
                      style={{ gridColumn: field === 'address' ? '1/-1' : 'auto' }}
                    >
                      <label className="form-label">{label}</label>
                      <input
                        type={type}
                        className="form-control"
                        placeholder={label}
                        value={shipping[field]}
                        onChange={e => setShipping({ ...shipping, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <select
                      className="form-control"
                      value={shipping.country}
                      onChange={e => setShipping({ ...shipping, country: e.target.value })}
                    >
                      {['India','USA','UK','Canada','Australia'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!isShippingValid()) return setError('Please fill all fields');
                    setError(''); setStep(1);
                  }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 1 — Payment */}
            {step === 1 && (
              <div className="checkout-section">
                <h2>Payment Method</h2>
                {[
                  { id: 'Razorpay',         icon: '💳', label: 'Razorpay',          sub: 'Cards, UPI, Net Banking, Wallets' },
                  { id: 'Cash on Delivery', icon: '💵', label: 'Cash on Delivery',   sub: 'Pay when your order arrives' },
                ].map(m => (
                  <label
                    key={m.id}
                    className={`payment-option ${payment === m.id ? 'selected' : ''}`}
                    onClick={() => setPayment(m.id)}
                  >
                    <input
                      type="radio" name="payment"
                      value={m.id} checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                    />
                    <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{m.sub}</div>
                    </div>
                    {payment === m.id && (
                      <span style={{ marginLeft: 'auto', color: 'var(--success)', fontWeight: 700 }}>✓</span>
                    )}
                  </label>
                ))}
                <div className="checkout-btns">
                  <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 2 — Review */}
            {step === 2 && (
              <div className="checkout-section">
                <h2>Review Order</h2>
                {error && <div className="alert alert-error">{error}</div>}

                <div className="review-items">
                  {cartItems.map(item => (
                    <div key={item._id} className="review-item">
                      <img
                        src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/80/80`}
                        alt={item.name}
                      />
                      <div>
                        <strong>{item.name}</strong>
                        <span>Qty: {item.qty}</span>
                      </div>
                      <span>₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="review-details">
                  <div>
                    <strong>Ship to:</strong> {shipping.fullName}, {shipping.address},
                    {shipping.city}, {shipping.state} — {shipping.postalCode}
                  </div>
                  <div><strong>Payment:</strong> {payment}</div>
                </div>

                <div className="checkout-btns">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="btn btn-primary"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading
                      ? 'Processing...'
                      : payment === 'Cash on Delivery'
                        ? `Place Order • ₹${total.toLocaleString()}`
                        : `Pay ₹${total.toLocaleString()} →`
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>

            <div className="summary-items">
              {cartItems.map(i => (
                <div key={i._id} className="summary-item">
                  <span>{i.name} × {i.qty}</span>
                  <span>₹ {(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹ {cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: shippingFee === 0 ? 'var(--success)' : 'inherit', fontWeight: shippingFee === 0 ? 600 : 400 }}>
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
              </span>
            </div>
            <div className="summary-row">
              <span>GST (18%)</span>
              <span>₹ {tax.toLocaleString()}</span>
            </div>

            {/* Discount row */}
            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount ({couponApplied?.code})</span>
                <span>− ₹ {discount.toLocaleString()}</span>
              </div>
            )}

            <div className="summary-row total-row">
              <strong>Total</strong>
              <strong>₹ {total.toLocaleString()}</strong>
            </div>

            {/* Coupon input */}
            <div className="coupon-section">
              <div className="coupon-label">Have a coupon?</div>
              {couponApplied ? (
                <div className="coupon-applied">
                  <div className="coupon-applied-info">
                    <span className="coupon-code-badge">{couponApplied.code}</span>
                    <span className="coupon-save">Save ₹  {discount.toLocaleString()}</span>
                  </div>
                  <button className="coupon-remove" onClick={handleRemoveCoupon}>✕</button>
                </div>
              ) : (
                <div className="coupon-input-wrap">
                  <input
                    type="text"
                    className="form-control coupon-input"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button
                    className="coupon-apply-btn"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponSuccess && <p className="coupon-success">✓ {couponSuccess}</p>}
              {couponError   && <p className="coupon-error">✕ {couponError}</p>}
            </div>

            <div className="secure-badges">
              <span>🔒 Secure Checkout</span>
              <span>🛡 SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;