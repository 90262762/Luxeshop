import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart }     from '../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>My Wishlist <span>({wishlist.length} items)</span></h1>
          {wishlist.length > 0 && (
            <button className="clear-btn" onClick={clearWishlist}>
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-icon">🤍</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love by clicking the heart icon.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products →
            </Link>
          </div>
        ) : (
          <>
            {/* Move all to cart */}
            <button
              className="btn btn-dark"
              style={{ marginBottom: '1.5rem' }}
              onClick={() => wishlist.forEach(p => addToCart(p))}
            >
              🛒 Add All to Cart
            </button>

            <div className="wishlist-grid">
              {wishlist.map(product => (
                <div key={product._id} className="wishlist-card">
                  <Link to={`/products/${product._id}`} className="wishlist-img-wrap">
                    <img
                      src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/300/200`}
                      alt={product.name}
                    />
                  </Link>
                  <div className="wishlist-info">
                    <span className="wishlist-category">{product.category}</span>
                    <Link to={`/products/${product._id}`}>
                      <h3>{product.name}</h3>
                    </Link>
                    <div className="wishlist-price">
                      <span className="price-current">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="price-original">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="wishlist-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => addToCart(product)}
                        disabled={product.countInStock === 0}
                      >
                        🛒 Add to Cart
                      </button>
                      <button
                        className="btn btn-sm remove-wish-btn"
                        onClick={() => removeFromWishlist(product._id)}
                      >
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;