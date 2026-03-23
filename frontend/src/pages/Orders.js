import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import './Orders.css';
import { useNotifications } from '../context/NotificationContext';
import { generateInvoice } from '../utils/generateInvoice';

const STATUS_COLORS = {
  pending:    '#f39c12',
  processing: '#3498db',
  shipped:    '#9b59b6',
  delivered:  '#27ae60',
  cancelled:  '#e74c3c',
};

const TIMELINE_STEPS = [
  { key: 'pending',    icon: '🕐', label: 'Ordered'    },
  { key: 'processing', icon: '⚙️', label: 'Processing' },
  { key: 'shipped',    icon: '🚚', label: 'Shipped'    },
  { key: 'delivered',  icon: '✅', label: 'Delivered'  },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

// ── Orders List ───────────────────────────────────────────────────
export const Orders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/myorders')
      .then(({ data }) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p><Link to="/products" className="link-accent">Start shopping →</Link></p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <Link to={`/orders/${order._id}`} key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span
                    className="order-status"
                    style={{
                      color:      STATUS_COLORS[order.status] || '#333',
                      background: (STATUS_COLORS[order.status] || '#333') + '18',
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="order-items-preview">
                  {order.orderItems.slice(0, 3).map(item => (
                    <img
                      key={item._id}
                      src={item.image || `https://picsum.photos/seed/${item.product}/60/60`}
                      alt={item.name} title={item.name}
                    />
                  ))}
                  {order.orderItems.length > 3 && (
                    <span className="more-items">+{order.orderItems.length - 3}</span>
                  )}
                </div>
                <div className="order-card-footer">
                  <span>{order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}</span>
                  <strong>₹{order.totalPrice.toLocaleString()}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Order Detail ──────────────────────────────────────────────────
export const OrderDetail = () => {
  const { id }         = useParams();
  const [searchParams] = useSearchParams();
  const [order,   setOrder]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [cancelling,    setCancelling]    = useState(false);
  const [cancelError,   setCancelError]   = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const success = searchParams.get('success');
  const [showReturnForm, setShowReturnForm] = useState(false);
const [returnReason,   setReturnReason]   = useState('');
const [returnLoading,  setReturnLoading]  = useState(false);
const [returnError,    setReturnError]    = useState('');
const [returnSuccess,  setReturnSuccess]  = useState('');
const { fetchNotifications } = useNotifications();

  useEffect(() => {
    API.get(`/orders/${id}`)
      .then(({ data }) => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true); setCancelError('');
    try {
      const { data } = await API.put(`/orders/${id}/cancel`);
      setOrder(data.order);
       fetchNotifications();
      setCancelSuccess('Order cancelled successfully. You will receive a confirmation email.');
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturn = async (e) => {
  e.preventDefault();
  if (!returnReason.trim()) return setReturnError('Please provide a reason');
  setReturnLoading(true); setReturnError('');
  try {
    const { data } = await API.put(`/orders/${id}/return`, { reason: returnReason });
    setOrder(data.order);
    setReturnSuccess('Return request submitted! We will process it within 2-3 business days.');
    setShowReturnForm(false);
  } catch (err) {
    setReturnError(err.response?.data?.message || 'Failed to submit return request');
  } finally {
    setReturnLoading(false);
  }
};

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!order)  return <p style={{ textAlign: 'center', padding: '3rem' }}>Order not found.</p>;

  const canCancel    = ['pending', 'processing'].includes(order.status);
  const currentIndex = STATUS_ORDER.indexOf(order.status);

  // Get timestamp for each step from tracking history
  const getStepDate = (status) => {
    if (!order.trackingHistory?.length) return null;
    const entry = order.trackingHistory.find(h => h.status === status);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="order-detail-page">
      <div className="container">

        {/* Alerts */}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            🎉 Order placed successfully! You will receive a confirmation email shortly.
          </div>
        )}
        {cancelSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            ✓ {cancelSuccess}
          </div>
        )}
        {cancelError && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            ✕ {cancelError}
          </div>
        )}

        {/* Header */}
        <div className="order-detail-header">
          <div>
            <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="order-date">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <span
            className="order-status-badge"
            style={{
              color:      STATUS_COLORS[order.status],
              background: STATUS_COLORS[order.status] + '18',
            }}
          >
            {order.status}
          </span>
        </div>

        {/* Cancelled banner */}
        {order.status === 'cancelled' && (
          <div className="cancelled-banner">
            <div className="cancelled-banner-icon">❌</div>
            <div className="cancelled-banner-text">
              <h4>Order Cancelled</h4>
              <p>
                This order has been cancelled.
                If you paid online, refund will be processed in 5-7 business days.
              </p>
            </div>
          </div>
        )}

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="order-timeline">
            <h3>📍 Order Tracking</h3>

            {/* Steps row */}
            <div className="timeline-steps">
              {TIMELINE_STEPS.map((step, i) => {
                const isDone    = i <= currentIndex;
                const isCurrent = i === currentIndex;
                const stepDate  = getStepDate(step.key);

                return (
                  <div
                    key={step.key}
                    className={`timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="timeline-icon">{step.icon}</div>
                    <div className="timeline-label">{step.label}</div>
                    {stepDate && (
                      <div className="timeline-date">{stepDate}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Activity log */}
            {order.trackingHistory?.length > 0 && (
              <div className="tracking-history">
                <h4>Activity Log</h4>
                {[...order.trackingHistory].reverse().map((h, i) => (
                  <div
                    key={i}
                    className={`history-item ${h.status === 'delivered' ? 'done' : ''} ${h.status === 'cancelled' ? 'cancel' : ''}`}
                  >
                    <div className="history-dot" />
                    <div className="history-content">
                      <div className="history-status">{h.status}</div>
                      <div className="history-message">{h.message}</div>
                    </div>
                    <div className="history-time">
                      {new Date(h.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}
                      <br />
                      {new Date(h.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="order-detail-grid">
          <div>

            {/* Items */}
            <div className="order-section">
              <h3>Items Ordered</h3>
              {order.orderItems.map(item => (
                <div key={item._id} className="order-item-row">
                  <img
                    src={item.image || `https://picsum.photos/seed/${item.product}/80/80`}
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

            {/* Shipping */}
            <div className="order-section">
              <h3>Shipping Address</h3>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
              <p>{order.shippingAddress.state} — {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p>📞 {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="order-summary-box">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order.itemsPrice?.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
            </div>
            <div className="summary-row">
              <span>GST</span>
              <span>₹{order.taxPrice?.toLocaleString()}</span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="summary-row" style={{ color: 'var(--success)', fontWeight: 600 }}>
                <span>Coupon ({order.couponCode})</span>
                <span>− ₹{order.couponDiscount?.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row total-row">
              <strong>Total</strong>
              <strong>₹{order.totalPrice?.toLocaleString()}</strong>
            </div>
            <div className="payment-info">
              <span>💳 {order.paymentMethod}</span>
              <span className={order.isPaid ? 'paid' : 'unpaid'}>
                {order.isPaid ? '✓ Paid' : '⏳ Pending'}
              </span>
            </div>
              {/* Download Invoice */}
<button
  className="invoice-btn"
  onClick={() => generateInvoice(order)}
>
  📄 Download Invoice
</button>
            {/* Cancel button */}
            {canCancel && (
              <button
                className="cancel-order-btn"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : '✕ Cancel Order'}
              </button>
            )}

            {order.status === 'cancelled' && (
              <div className="cancelled-badge">
                ✕ This order has been cancelled
              </div>
            )}

            {/* Return request */}
{order.status === 'delivered' && !order.returnRequested && (
  <button
    className="return-btn"
    onClick={() => setShowReturnForm(!showReturnForm)}
  >
    🔄 Request Return
  </button>
)}

{/* Return form */}
{showReturnForm && (
  <div className="return-form">
    <h4>Why do you want to return?</h4>
    {returnError && <p style={{ color: 'var(--danger)', fontSize: '0.82rem' }}>{returnError}</p>}
    <select
      className="form-control"
      style={{ marginBottom: '0.75rem', fontSize: '0.88rem' }}
      value={returnReason}
      onChange={e => setReturnReason(e.target.value)}
    >
      <option value="">Select reason...</option>
      <option value="Damaged product">Damaged product</option>
      <option value="Wrong item received">Wrong item received</option>
      <option value="Product not as described">Product not as described</option>
      <option value="Changed my mind">Changed my mind</option>
      <option value="Better price available">Better price available</option>
      <option value="Other">Other</option>
    </select>
    <button
      className="btn btn-primary btn-block btn-sm"
      onClick={handleReturn}
      disabled={returnLoading}
    >
      {returnLoading ? 'Submitting...' : 'Submit Return Request'}
    </button>
    <button
      className="btn btn-outline btn-block btn-sm"
      style={{ marginTop: '0.5rem' }}
      onClick={() => setShowReturnForm(false)}
    >
      Cancel
    </button>
  </div>
)}

{/* Return status */}
{order.returnRequested && (
  <div className={`return-status-badge return-${order.returnStatus}`}>
    {order.returnStatus === 'requested' && '⏳ Return Requested'}
    {order.returnStatus === 'approved'  && '✓ Return Approved'}
    {order.returnStatus === 'rejected'  && '✕ Return Rejected'}
  </div>
)}

{returnSuccess && (
  <div className="alert alert-success" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>
    {returnSuccess}
  </div>
)}
          </div>
        </div>

        <Link to="/orders" className="btn btn-outline" style={{ marginTop: '2rem' }}>
          ← My Orders
        </Link>
      </div>
    </div>
  );
};