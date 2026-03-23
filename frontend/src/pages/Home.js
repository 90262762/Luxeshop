import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featured,       setFeatured]       = useState([]);
  const [newArrivals,    setNewArrivals]     = useState([]);
  const [topDeals,       setTopDeals]        = useState([]);
  const [loading,        setLoading]         = useState(true);
  const [search,         setSearch]          = useState('');
  const [activeCategory, setActiveCategory]  = useState('All');
  const [heroIndex,      setHeroIndex]       = useState(0);
  const [scrollY,        setScrollY]         = useState(0);
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const heroRef = useRef();

  const HERO_SLIDES = [
    {
      tag:     'New Season',
      title:   'Elevate Your\nEveryday Style',
      sub:     'Curated collections from the world\'s finest brands',
      cta:     'Shop Collection',
      link:    '/products?category=Fashion',
      image:   'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
      accent:  '#e94560',
      bg:      'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    },
    {
      tag:     'Tech Essentials',
      title:   'Power Your\nDigital Life',
      sub:     'Latest electronics at unbeatable prices',
      cta:     'Explore Electronics',
      link:    '/products?category=Electronics',
      image:   'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      accent:  '#4facfe',
      bg:      'linear-gradient(135deg, #0a0a14, #1a1a2e, #0f3460)',
    },
    {
      tag:     'Home & Living',
      title:   'Design Your\nPerfect Space',
      sub:     'Transform your home with premium décor',
      cta:     'Shop Home',
      link:    '/products?category=Home',
      image:   'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      accent:  '#43e97b',
      bg:      'linear-gradient(135deg, #0d1117, #1a2a1a, #0f2010)',
    },
  ];

  const CATEGORIES = [
    { name: 'Electronics', icon: '💻', color: '#4facfe', bg: 'rgba(79,172,254,0.1)',  image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80' },
    { name: 'Fashion',     icon: '👗', color: '#e94560', bg: 'rgba(233,69,96,0.1)',   image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80' },
    { name: 'Home',        icon: '🏠', color: '#43e97b', bg: 'rgba(67,233,123,0.1)',  image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80' },
    { name: 'Sports',      icon: '⚽', color: '#f5a623', bg: 'rgba(245,166,35,0.1)',  image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80' },
    { name: 'Books',       icon: '📚', color: '#9b59b6', bg: 'rgba(155,89,182,0.1)',  image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80' },
    { name: 'Beauty',      icon: '💄', color: '#e91e8c', bg: 'rgba(233,30,140,0.1)',  image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80' },
  ];

  const BRANDS = [
    { name: 'Apple',    logo: '🍎' },
    { name: 'Samsung',  logo: '📱' },
    { name: 'Nike',     logo: '👟' },
    { name: 'Adidas',   logo: '🎽' },
    { name: 'Sony',     logo: '🎵' },
    { name: 'LG',       logo: '📺' },
    { name: 'Puma',     logo: '🐆' },
    { name: 'Boat',     logo: '🎧' },
  ];

  const TRUST = [
    { icon: '🚚', title: 'Free Delivery',    sub: 'On orders above ₹999',      color: '#4facfe' },
    { icon: '🔄', title: 'Easy Returns',     sub: '7-day hassle-free returns',  color: '#43e97b' },
    { icon: '🔒', title: 'Secure Payment',   sub: '100% encrypted checkout',    color: '#e94560' },
    { icon: '🎁', title: 'Gift Wrapping',    sub: 'Special packaging available', color: '#f5a623' },
    { icon: '⚡', title: 'Express Shipping', sub: 'Delivery in 24-48 hours',    color: '#9b59b6' },
    { icon: '🏆', title: 'Premium Quality',  sub: 'Genuine products only',      color: '#e91e8c' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featR, allR] = await Promise.all([
          API.get('/products?featured=true&limit=8'),
          API.get('/products?limit=12&sort=newest'),
        ]);
        setFeatured(featR.data.products || []);
        setNewArrivals(allR.data.products || []);

        // Get deals (products with originalPrice)
        const dealsR = await API.get('/products?limit=6&sort=discount');
        setTopDeals(dealsR.data.products?.filter(p => p.originalPrice) || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Auto-advance hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Parallax scroll
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?keyword=${search.trim()}`);
  };

  const slide = HERO_SLIDES[heroIndex];

  const filteredFeatured = activeCategory === 'All'
    ? featured
    : featured.filter(p => p.category === activeCategory);

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero-section" ref={heroRef} style={{ background: slide.bg }}>
        <div className="hero-noise" />
        <div className="hero-grid-lines" />

        {/* Floating orbs */}
        <div className="hero-orb orb-1" style={{ background: slide.accent }} />
        <div className="hero-orb orb-2" style={{ background: slide.accent }} />
        <div className="hero-orb orb-3" />

        <div className="hero-content container">
          <div className="hero-text" key={heroIndex}>
            <div className="hero-tag">
              <span className="hero-tag-dot" style={{ background: slide.accent }} />
              {slide.tag}
            </div>
            <h1 className="hero-title">
              {slide.title.split('\n').map((line, i) => (
                <span key={i} className="hero-line" style={{ animationDelay: `${i * 0.12}s` }}>
                  {i === 1
                    ? <span style={{ color: slide.accent }}>{line}</span>
                    : line
                  }
                </span>
              ))}
            </h1>
            <p className="hero-sub">{slide.sub}</p>
            <div className="hero-actions">
              <Link to={slide.link} className="hero-cta" style={{ background: slide.accent }}>
                {slide.cta}
                <span className="hero-cta-arrow">→</span>
              </Link>
              <Link to="/products" className="hero-ghost">
                View All
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num">50K+</span>
                <span className="hero-stat-label">Products</span>
              </div>
              <div className="hero-stat-div" />
              <div className="hero-stat">
                <span className="hero-stat-num">2M+</span>
                <span className="hero-stat-label">Customers</span>
              </div>
              <div className="hero-stat-div" />
              <div className="hero-stat">
                <span className="hero-stat-num">4.9★</span>
                <span className="hero-stat-label">Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-image-wrap" key={`img-${heroIndex}`}>
            <div className="hero-image-glow" style={{ background: slide.accent }} />
            <div className="hero-image-frame">
              <img
                src={slide.image}
                alt="hero"
                className="hero-image"
                style={{ transform: `translateY(${scrollY * 0.08}px)` }}
              />
            </div>
            <div className="hero-image-badge" style={{ borderColor: slide.accent }}>
              <span style={{ color: slide.accent }}>✦</span> Premium Quality
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="hero-dots">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={i}
              className={`hero-dot ${i === heroIndex ? 'active' : ''}`}
              style={{ background: i === heroIndex ? slide.accent : 'rgba(255,255,255,0.3)' }}
              onClick={() => setHeroIndex(i)}
            />
          ))}
        </div>

        {/* Search bar */}
        <div className="hero-search-wrap container">
          <form className="hero-search" onSubmit={handleSearch}>
            <select
              className="hero-search-cat"
              onChange={e => e.target.value && navigate(`/products?category=${e.target.value}`)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <div className="hero-search-div" />
            <input
              type="text"
              placeholder="Search for products, brands, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              🔍 Search
            </button>
          </form>
          <div className="hero-popular">
            <span>Popular:</span>
            {['iPhone', 'Nike Air', 'MacBook', 'Smart TV'].map(t => (
              <button
                key={t}
                className="hero-popular-tag"
                onClick={() => navigate(`/products?keyword=${t}`)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="trust-bar">
        <div className="container trust-grid">
          {TRUST.map(t => (
            <div key={t.title} className="trust-item">
              <div className="trust-icon" style={{ color: t.color, background: t.color + '15' }}>
                {t.icon}
              </div>
              <div>
                <div className="trust-title">{t.title}</div>
                <div className="trust-sub">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Browse</div>
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <Link to="/products" className="section-link">View All →</Link>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="cat-card"
              >
                <div className="cat-image-wrap">
                  <img src={cat.image} alt={cat.name} className="cat-image" />
                  <div className="cat-overlay" style={{ background: cat.color + '88' }} />
                </div>
                <div className="cat-content">
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Handpicked</div>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="section-link">View All →</Link>
          </div>

          {/* Category filter pills */}
          <div className="filter-pills">
            {['All', ...CATEGORIES.map(c => c.name)].map(cat => (
              <button
                key={cat}
                className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="skeleton-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          ) : filteredFeatured.length > 0 ? (
            <div className="product-grid">
              {filteredFeatured.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-cat">
              <span>No featured products in {activeCategory} yet</span>
              <Link to={`/products?category=${activeCategory}`} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Browse {activeCategory} →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="promo-banner">
        <div className="promo-noise" />
        <div className="container promo-inner">
          <div className="promo-text">
            <div className="promo-tag">Limited Time Offer</div>
            <h2 className="promo-title">Get 20% Off Your First Order</h2>
            <p className="promo-sub">Use code <strong>WELCOME20</strong> at checkout</p>
            <Link to="/products" className="promo-cta">
              Shop Now & Save
            </Link>
          </div>
          <div className="promo-visual">
            <div className="promo-circle circle-1" />
            <div className="promo-circle circle-2" />
            <div className="promo-code-badge">
              <span className="promo-code-label">Promo Code</span>
              <span className="promo-code-text">WELCOME20</span>
              <span className="promo-code-save">Save 20%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="section new-arrivals-section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-tag">Just In</div>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/products?sort=newest" className="section-link">View All →</Link>
          </div>
          {loading ? (
            <div className="skeleton-grid">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {newArrivals.slice(0, 8).map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section className="brands-section">
        <div className="container">
          <div className="section-head" style={{ marginBottom: '1.5rem' }}>
            <div>
              <div className="section-tag">Partners</div>
              <h2 className="section-title">Top Brands</h2>
            </div>
          </div>
          <div className="brands-track-wrap">
            <div className="brands-track">
              {[...BRANDS, ...BRANDS].map((b, i) => (
                <div key={i} className="brand-item">
                  <span className="brand-logo">{b.logo}</span>
                  <span className="brand-name">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP DEALS ── */}
      {topDeals.length > 0 && (
        <section className="section deals-section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-tag">Save Big</div>
                <h2 className="section-title">🔥 Hot Deals</h2>
              </div>
              <Link to="/products" className="section-link">View All →</Link>
            </div>
            <div className="product-grid">
              {topDeals.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── APP DOWNLOAD BANNER ── */}
      <section className="app-banner">
        <div className="container app-inner">
          <div className="app-text">
            <div className="section-tag" style={{ color: '#f5a623' }}>Mobile App</div>
            <h2 className="app-title">Shop Smarter on the Go</h2>
            <p className="app-sub">
              Get exclusive app-only deals, track orders in real-time,
              and enjoy a seamless shopping experience.
            </p>
            <div className="app-badges">
              <div className="app-badge">
                <span style={{ fontSize: '1.4rem' }}>🍎</span>
                <div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Download on the</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>App Store</div>
                </div>
              </div>
              <div className="app-badge">
                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                <div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Get it on</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Google Play</div>
                </div>
              </div>
            </div>
          </div>
          <div className="app-phones">
            <div className="phone phone-back">
              <div className="phone-screen">
                <div className="phone-screen-content">
                  <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>◆ LuxeShop</div>
                  <div style={{ fontSize: '0.55rem', opacity: 0.6 }}>Your orders</div>
                  {['Order #A1B2 — Shipped 🚚', 'Order #C3D4 — Delivered ✅'].map(o => (
                    <div key={o} style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '6px', padding: '5px 8px',
                      fontSize: '0.5rem', marginTop: '4px',
                    }}>{o}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="phone phone-front">
              <div className="phone-screen">
                <div className="phone-screen-content">
                  <div style={{ fontSize: '0.55rem', opacity: 0.6, marginBottom: '4px' }}>Featured</div>
                  <div style={{
                    background: 'linear-gradient(135deg,#e94560,#f5a623)',
                    borderRadius: '8px', padding: '8px',
                    fontSize: '0.55rem', marginBottom: '6px',
                  }}>
                    ⚡ Flash Sale — 50% OFF
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                    {['📱','💻','👟','🎧'].map(e => (
                      <div key={e} style={{
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '5px', padding: '6px',
                        fontSize: '1rem', textAlign: 'center',
                      }}>{e}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECENTLY VIEWED ── */}
      {recentlyViewed.length > 0 && (
        <section className="section recently-viewed-section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-tag">Continue Browsing</div>
                <h2 className="section-title">Recently Viewed</h2>
              </div>
              <button className="section-link" onClick={clearRecentlyViewed}>
                Clear ✕
              </button>
            </div>
            <div className="product-grid">
              {recentlyViewed.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section">
        <div className="newsletter-bg" />
        <div className="container newsletter-inner">
          <div className="newsletter-icon">✉️</div>
          <h2 className="newsletter-title">Stay in the Loop</h2>
          <p className="newsletter-sub">
            Subscribe for exclusive deals, new arrivals, and style inspiration
          </p>
          <form
            className="newsletter-form"
            onSubmit={e => { e.preventDefault(); alert('Thanks for subscribing! 🎉'); }}
          >
            <input
              type="email"
              placeholder="Enter your email address..."
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </form>
          <p className="newsletter-note">
            🔒 No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;