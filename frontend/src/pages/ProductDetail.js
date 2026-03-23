import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useCart }     from '../context/CartContext';
import { useAuth }     from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const Stars = ({ rating, interactive, onRate }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => (
      <span
        key={s}
        className={`star ${s <= Math.round(rating) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={() => interactive && onRate(s)}
      >★</span>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addToCart }                    = useCart();
  const { user }                         = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist(); // ✅ inside component

  const [editingReview, setEditingReview] = useState(null);
const [editRating,    setEditRating]    = useState(5);
const [editComment,   setEditComment]   = useState('');

  const [product,       setProduct]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [activeImg,     setActiveImg]     = useState(0);
  const [qty,           setQty]           = useState(1);
  const [rating,        setRating]        = useState(5);
  const [comment,       setComment]       = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [msg,           setMsg]           = useState('');
  const [added,         setAdded]         = useState(false);

  

  const { addToRecentlyViewed } = useRecentlyViewed();
  const [relatedProducts, setRelatedProducts] = useState([]);

// Add inside useEffect after fetching product
useEffect(() => {
  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);

      // ✅ Fetch related products
      const { data: related } = await API.get(`/products/${id}/related`);
      setRelatedProducts(related);
    } catch { navigate('/products'); }
    finally { setLoading(false); }
  };
  fetchProduct();
}, [id, navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch { navigate('/products'); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleEditReview = async (reviewId) => {
  try {
    await API.put(`/products/${id}/reviews/${reviewId}`, {
      rating:  editRating,
      comment: editComment,
    });
    const { data } = await API.get(`/products/${id}`);
    setProduct(data);
    setEditingReview(null);
    setMsg('Review updated!');
  } catch (err) {
    setMsg(err.response?.data?.message || 'Error updating review');
  }
};

const handleDeleteReview = async (reviewId) => {
  if (!window.confirm('Delete this review?')) return;
  try {
    await API.delete(`/products/${id}/reviews/${reviewId}`);
    const { data } = await API.get(`/products/${id}`);
    setProduct(data);
    setMsg('Review deleted.');
  } catch (err) {
    setMsg(err.response?.data?.message || 'Error deleting review');
  }
};

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  useEffect(() => {
  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
      addToRecentlyViewed(data); // ✅ track viewed product
      const { data: related } = await API.get(`/products/${id}/related`);
      setRelatedProducts(related);
    } catch { navigate('/products'); }
    finally { setLoading(false); }
  };
  fetchProduct();
}, [id, navigate]);


  const handleReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await API.post(`/products/${id}/reviews`, { rating, comment });
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
      setComment('');
      setMsg('Review submitted!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error submitting review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!product) return null;

  const images     = product.images?.length
    ? product.images
    : [`https://picsum.photos/seed/${product._id}/600/500`];
  const discount   = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const wishlisted = isWishlisted(product._id); // ✅ inside component, after product loaded

  return (
    <div className="product-detail">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="detail-grid">

         {/* Image Gallery */}
<div className="detail-images">
  <div className="main-image-wrap">
    <img src={images[activeImg]} alt={product.name} className="main-image" />
    {discount > 0 && <span className="detail-discount">-{discount}% OFF</span>}

    {/* Navigation arrows for multiple images */}
    {images.length > 1 && (
      <>
        <button
          className="img-nav img-prev"
          onClick={() => setActiveImg(i => Math.max(0, i - 1))}
          disabled={activeImg === 0}
        >
          ‹
        </button>
        <button
          className="img-nav img-next"
          onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
          disabled={activeImg === images.length - 1}
        >
          ›
        </button>
      </>
    )}
  </div>

  {/* Thumbnails */}
  {images.length > 1 && (
    <div className="thumb-row">
      {images.map((img, i) => (
        <img
          key={i} src={img} alt=""
          className={`thumb ${i === activeImg ? 'active' : ''}`}
          onClick={() => setActiveImg(i)}
        />
      ))}
    </div>
  )}
</div>

          {/* Info */}
          <div className="detail-info">
            <span className="detail-category">{product.category}</span>
            <h1 className="detail-title">{product.name}</h1>
            {product.brand && (
              <p className="detail-brand">By <strong>{product.brand}</strong></p>
            )}

            <div className="detail-rating">
              <Stars rating={product.rating} />
              <span>{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>

            <div className="detail-price">
              <span className="detail-price-current">
                ₹ {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="detail-price-original">
                  ₹ {product.originalPrice.toLocaleString()}
                </span>
              )}
              {discount > 0 && (
                <span className="badge badge-primary">Save {discount}%</span>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            <div className={`stock-status ${product.countInStock > 0 ? 'in-stock' : 'out'}`}>
              {product.countInStock > 0
                ? `✓ In Stock (${product.countInStock} available)`
                : '✕ Out of Stock'
              }
            </div>

            {/* Cart + Wishlist actions */}
            <div className="detail-actions">
              {product.countInStock > 0 && (
                <>
                  <div className="qty-control">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.countInStock, q + 1))}>+</button>
                  </div>
                  <button
                    className={`btn btn-primary add-btn ${added ? 'added' : ''}`}
                    onClick={handleAddToCart}
                  >
                    {added ? '✓ Added!' : '🛒 Add to Cart'}
                  </button>
                </>
              )}

              {/* Wishlist button */}
              {user && (
                <button
                  className={`btn ${wishlisted ? 'btn-wishlisted' : 'btn-outline'}`}
                  onClick={() => toggleWishlist(product)}
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
                </button>
              )}
            </div>

            {product.tags?.length > 0 && (
              <div className="detail-tags">
                {product.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>

          {product.reviews?.length === 0 && (
            <p className="no-reviews">No reviews yet. Be the first!</p>
          )}

          <div className="reviews-list">
  {product.reviews?.map(r => (
    <div key={r._id} className="review-card">
      <div className="review-header">
        <div className="reviewer-avatar">{r.name[0]}</div>
        <div>
          <strong>{r.name}</strong>
          <Stars rating={r.rating} />
        </div>
        <span className="review-date">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>

        {/* Edit/Delete buttons — only for review owner */}
        {user && r.user === user._id && (
          <div className="review-actions">
            <button
              className="review-action-btn edit"
              onClick={() => {
                setEditingReview(r._id);
                setEditRating(r.rating);
                setEditComment(r.comment);
              }}
            >
              ✏️
            </button>
            <button
              className="review-action-btn delete"
              onClick={() => handleDeleteReview(r._id)}
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {/* Edit form */}
      {editingReview === r._id ? (
        <div className="review-edit-form">
          <Stars rating={editRating} interactive onRate={setEditRating} />
          <textarea
            className="form-control"
            rows={2}
            value={editComment}
            onChange={e => setEditComment(e.target.value)}
            style={{ margin: '0.5rem 0' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleEditReview(r._id)}
            >
              Save
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setEditingReview(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="review-comment">{r.comment}</p>
      )}
    </div>
  ))}
</div>

          {user ? (
            <form className="review-form" onSubmit={handleReview}>
              <h3>Write a Review</h3>
              {msg && (
                <div className={`alert ${
                  msg.includes('Error') || msg.includes('Already')
                    ? 'alert-error' : 'alert-success'
                }`}>
                  {msg}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Rating</label>
                <Stars rating={rating} interactive onRate={setRating} />
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-control" rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  required placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit" className="btn btn-primary"
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="review-login">
              Please <a href="/login">sign in</a> to write a review.
            </p>
          )}
        </div>

{/* Related Products */}
{relatedProducts.length > 0 && (
  <div className="related-section">
    <h2 className="related-title">You May Also Like</h2>
    <p className="related-sub">More from {product.category}</p>
    <div className="product-grid">
      {relatedProducts.map(p => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default ProductDetail;