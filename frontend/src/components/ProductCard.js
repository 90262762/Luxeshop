import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth }     from '../context/AuthContext';
import './ProductCard.css';

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>
    ))}
  </div>
);

const ProductCard = ({ product }) => {
  const { addToCart }                    = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user }                         = useAuth();
  const [adding, setAdding]              = useState(false);

  const wishlisted = isWishlisted(product._id);
  const discount   = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (adding || product.countInStock === 0) return;
    setAdding(true);
    addToCart(product);
    setTimeout(() => setAdding(false), 1200);
  };

  return (
    <div className={`product-card ${product.countInStock === 0 ? 'out-of-stock' : ''}`}>

      {/* ── Image ── */}
      <Link to={`/products/${product._id}`} className="card-image-wrap">
        <img
          src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/300`}
          alt={product.name}
          className="card-image"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="card-image-overlay" />

        {/* Discount badge */}
        {discount > 0 && (
          <span className="discount-badge">−{discount}%</span>
        )}

        {/* Out of stock */}
        {product.countInStock === 0 && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}

        {/* Quick view pill — appears on hover */}
        <div className="quick-view-pill">Quick View →</div>
      </Link>

      {/* ── Wishlist button ── */}
      {user && (
        <button
          className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Toggle wishlist"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      )}

      {/* ── Card Body ── */}
      <div className="card-body">

        {/* Category + Rating row */}
        <div className="card-meta-row">
          <span className="card-category">{product.category}</span>
          <div className="card-rating">
            <Stars rating={product.rating} />
            <span className="rating-count">{product.numReviews}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/products/${product._id}`} className="card-title-link">
          <h3 className="card-title">{product.name}</h3>
        </Link>

        {/* Footer — price + cart */}
        <div className="card-footer">
          <div className="card-price">
            <span className="price-current">₹ {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="price-original">₹ {product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            className={`add-to-cart-btn ${adding ? 'added' : ''} ${product.countInStock === 0 ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            title="Add to Cart"
            aria-label="Add to cart"
          >
            {adding ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;