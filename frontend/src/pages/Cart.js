import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQty, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal > 999 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.18);
  const total = cartTotal + shipping + tax;

  if (cartItems.length === 0) return (
    <div className="cart-empty">
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--text-light)', margin: '0.75rem 0 2rem' }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping →</Link>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart <span>({cartItems.length} items)</span></h1>
          <button className="clear-cart" onClick={clearCart}>Clear Cart</button>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/200/200`}
                  alt={item.name} className="cart-item-img"
                />
                <div className="cart-item-info">
                  <Link to={`/products/${item._id}`}><h3>{item.name}</h3></Link>
                  <span className="item-category">{item.category}</span>
                  <div className="item-price-row">
                    <div className="qty-control">
                      <button onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                    </div>
                    <span className="item-subtotal">₹ {(item.price * item.qty).toLocaleString()}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item._id)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>₹ {cartTotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span className="free-ship">FREE</span> : `₹ ${shipping}`}</span></div>
              <div className="summary-row"><span>GST (18%)</span><span>₹ {tax.toLocaleString()}</span></div>
              <div className="summary-row total-row"><strong>Total</strong><strong>₹ {total.toLocaleString()}</strong></div>
            </div>
            {shipping > 0 && <p className="free-ship-note">Add ₹ {(999 - cartTotal).toLocaleString()} more for free shipping!</p>}
            <button className="btn btn-primary btn-block"
              onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}>
              {user ? 'Proceed to Checkout →' : 'Sign In to Checkout →'}
            </button>
            <Link to="/products" className="btn btn-outline btn-block" style={{ marginTop: '0.75rem' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
