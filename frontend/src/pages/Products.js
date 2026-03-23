import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const Products = () => {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [pages,       setPages]       = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const params   = new URLSearchParams(location.search);

  const keyword  = params.get('keyword')  || '';
  const category = params.get('category') || 'all';
  const sort     = params.get('sort')     || 'newest';
  const page     = parseInt(params.get('page')) || 1;
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';

  // Lock body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ✅ 1. updateParam defined FIRST
  const updateParam = useCallback((key, value) => {
    const p = new URLSearchParams(location.search);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    navigate(`/products?${p.toString()}`);
  }, [location.search, navigate]);

  // ✅ 2. selectCategory defined AFTER updateParam
  const selectCategory = (value) => {
    updateParam('category', value);
    setSidebarOpen(false);
  };

  // ✅ 3. clearFilters defined last
  const clearFilters = () => {
    navigate('/products');
    setSidebarOpen(false);
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          API.get('/products', {
            params: {
              keyword,
              category: category === 'all' ? '' : category,
              sort, page, minPrice, maxPrice,
            },
          }),
          API.get('/products/categories'),
        ]);
        setProducts(prodRes.data.products);
        setTotal(prodRes.data.total);
        setPages(prodRes.data.pages);
        setCategories(catRes.data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, sort, page, minPrice, maxPrice]);

 return (
    <div className="products-page">
      <div className="container">

        {/* Header */}
        <div className="products-header">
          <div>
            <h1>Shop All Products</h1>
            {keyword && (
              <p className="search-label">Results for: <strong>"{keyword}"</strong></p>
            )}
            <p className="results-count">{total} products found</p>
          </div>
          <div className="products-controls">
            <select
              className="form-control sort-select"
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              className="btn btn-outline btn-sm filter-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              ☰ Filters
              {(category !== 'all' || minPrice || maxPrice) && (
                <span className="filter-active-dot" />
              )}
            </button>
          </div>
        </div>

        <div className="products-layout">

          {/* ✅ Overlay — click to close sidebar */}
          {sidebarOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`products-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button
                className="sidebar-close"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="filter-group">
              <h4>Category</h4>

              {/* ✅ All button uses selectCategory */}
              <button
                className={`filter-btn ${category === 'all' ? 'active' : ''}`}
                onClick={() => selectCategory('')}
              >
                All
              </button>

              {/* ✅ Each category uses selectCategory */}
              {categories.map(c => (
                <button
                  key={c}
                  className={`filter-btn ${category === c ? 'active' : ''}`}
                  onClick={() => selectCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={e => updateParam('minPrice', e.target.value)}
                />
                <span>–</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={e => updateParam('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* ✅ Apply button closes sidebar */}
            <button
              className="btn btn-primary btn-block btn-sm"
              onClick={() => setSidebarOpen(false)}
            >
              ✓ Apply Filters
            </button>

            {/* ✅ Clear button uses clearFilters */}
            <button
              className="btn btn-outline btn-block btn-sm"
              style={{ marginTop: '0.6rem' }}
              onClick={clearFilters}
            >
              Clear All
            </button>
          </aside>

          {/* Grid */}
          <div className="products-main">
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {pages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`page-btn ${p === page ? 'active' : ''}`}
                        onClick={() => {
                          const ps = new URLSearchParams(location.search);
                          ps.set('page', p);
                          navigate(`/products?${ps.toString()}`);
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default Products;
