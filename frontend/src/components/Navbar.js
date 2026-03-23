import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }          from '../context/AuthContext';
import { useCart }          from '../context/CartContext';
import { useWishlist }      from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';
import { useDarkMode }      from '../hooks/useDarkMode';
import {
  ShoppingCart, Heart, Bell, User, LogOut,
  Package, LayoutDashboard, Search, Menu, X,
  ChevronDown, Home, ShoppingBag, ClipboardList,
  Tag, Zap, Gift,
} from 'lucide-react';
import './Navbar.css';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', desc: '48 products' },
  { name: 'Fashion',     icon: '👗', desc: '120 products' },
  { name: 'Home',        icon: '🏠', desc: '65 products' },
  { name: 'Sports',      icon: '⚽', desc: '34 products' },
  { name: 'Books',       icon: '📚', desc: '89 products' },
  { name: 'Beauty',      icon: '💄', desc: '56 products' },
];

const Navbar = () => {
  const { user, logout }   = useAuth();
  const { cartCount }      = useCart();
  const { wishCount }      = useWishlist();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [search,      setSearch]      = useState('');
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [catOpen,     setCatOpen]     = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [bellShake,   setBellShake]   = useState(false);

  const dropRef   = useRef();
  const catRef    = useRef();
  const notifRef  = useRef();
  const searchRef = useRef();
  const prevCountRef = useRef(0);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Outside click handler
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false);
      if (catRef.current   && !catRef.current.contains(e.target))   setCatOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setMenuOpen(false); setDropOpen(false);
    setCatOpen(false);  setNotifOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Bell shake on new notification
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setBellShake(true);
      setTimeout(() => setBellShake(false), 800);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false); setDropOpen(false);
        setCatOpen(false);  setNotifOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${search.trim()}`);
      setSearch(''); setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout(); navigate('/'); setDropOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
     <div className="sticky-header">
      {/* ── TOP BAR ── */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <span className="topbar-item">
              <Zap size={11} />
              Free delivery on orders above ₹999
            </span>
            <span className="topbar-sep">·</span>
            <span className="topbar-item">
              <Gift size={11} />
              Use code <strong>WELCOME20</strong> for 20% off
            </span>
          </div>
          <div className="topbar-right">
            {!user && (
              <>
                <Link to="/login"    className="topbar-link">Sign In</Link>
                <span className="topbar-sep">·</span>
                <Link to="/register" className="topbar-link">Register</Link>
                <span className="topbar-sep">·</span>
              </>
            )}
            <span className="topbar-link">📞 +91 98765 43210</span>
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-diamond">◆</span>
            <span className="logo-text">
              LUXE<span className="logo-accent">SHOP</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>

            {/* Categories mega dropdown */}
            <div className="nav-cat-wrap" ref={catRef}>
              <button
                className={`nav-link nav-cat-btn ${catOpen ? 'active' : ''}`}
                onClick={() => setCatOpen(!catOpen)}
              >
                Categories
                <ChevronDown size={14} className={`cat-chevron ${catOpen ? 'open' : ''}`} />
              </button>

              {catOpen && (
                <div className="mega-menu">
                  <div className="mega-menu-inner">
                    <div className="mega-left">
                      <div className="mega-title">Shop by Category</div>
                      <div className="mega-cats">
                        {CATEGORIES.map(cat => (
                          <Link
                            key={cat.name}
                            to={`/products?category=${cat.name}`}
                            className="mega-cat-item"
                            onClick={() => setCatOpen(false)}
                          >
                            <span className="mega-cat-icon">{cat.icon}</span>
                            <div>
                              <div className="mega-cat-name">{cat.name}</div>
                              <div className="mega-cat-desc">{cat.desc}</div>
                            </div>
                            <span className="mega-cat-arrow">→</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="mega-right">
                      <div className="mega-promo">
                        <div className="mega-promo-tag">Flash Sale</div>
                        <div className="mega-promo-title">Up to 50% Off</div>
                        <div className="mega-promo-sub">Limited time deals on top brands</div>
                        <Link
                          to="/products"
                          className="mega-promo-btn"
                          onClick={() => setCatOpen(false)}
                        >
                          Shop Now →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
              Products
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="navbar-actions">

            {/* Search toggle */}
            <div className="search-wrap" ref={searchRef}>
              <button
                className="action-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                title="Search"
              >
                <Search size={22} />
              </button>
              {searchOpen && (
                <form className="search-dropdown" onSubmit={handleSearch}>
                  <Search size={16} className="search-dropdown-icon" />
                  <input
                    type="text"
                    placeholder="Search products, brands..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                  />
                  {search && (
                    <button type="button" className="search-clear" onClick={() => setSearch('')}>
                      <X size={14} />
                    </button>
                  )}
                  <button type="submit" className="search-submit">Go</button>
                </form>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              className="dark-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            {user && (
              <div className="notif-wrap" ref={notifRef}>
                <button
                  className={`action-btn ${bellShake ? 'shake' : ''}`}
                  onClick={() => setNotifOpen(!notifOpen)}
                  title="Notifications"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="action-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="notif-panel">
                    <div className="notif-panel-head">
                      <span className="notif-panel-title">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="notif-count-badge">{unreadCount}</span>
                        )}
                      </span>
                      {unreadCount > 0 && (
                        <button className="notif-read-all" onClick={markAllRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">
                          <Bell size={28} className="notif-empty-icon" />
                          <p>No notifications yet</p>
                          <span>You're all caught up!</span>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <div
                            key={n._id}
                            className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                            onClick={() => {
                              markRead(n._id);
                              setNotifOpen(false);
                              if (n.link) navigate(n.link);
                            }}
                          >
                            <div className={`notif-type-icon ${n.type}`}>
                              {n.type === 'order' ? '📦' : '🔔'}
                            </div>
                            <div className="notif-body">
                              <div className="notif-title">{n.title}</div>
                              <div className="notif-msg">{n.message}</div>
                              <div className="notif-time">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </div>
                            </div>
                            {!n.isRead && <div className="notif-unread-dot" />}
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="notif-footer">
                        <Link to="/orders" onClick={() => setNotifOpen(false)}>
                          View all orders →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="action-btn" title="Wishlist">
              <Heart size={22} />
              {wishCount > 0 && <span className="action-badge">{wishCount}</span>}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="action-btn cart-btn" title="Cart">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="action-badge cart-badge">{cartCount}</span>}
            </Link>

            {/* User */}
            {user ? (
              <div className="user-wrap" ref={dropRef}>
                <button
                  className="user-trigger"
                  onClick={() => setDropOpen(!dropOpen)}
                >
                  <div className="user-avatar-btn">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} />
                      : <span>{user.name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <span className="user-name-btn">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={13} className={`user-chevron ${dropOpen ? 'open' : ''}`} />
                </button>

                {dropOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {user.avatar
                          ? <img src={user.avatar} alt={user.name} />
                          : <span>{user.name?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div className="dropdown-user-info">
                        <div className="dropdown-name">{user.name}</div>
                        <div className="dropdown-email">{user.email}</div>
                        {user.isAdmin && (
                          <span className="dropdown-admin-badge">Admin</span>
                        )}
                      </div>
                    </div>
                    <div className="dropdown-section">
                      <Link to="/profile" className="dropdown-item">
                        <User size={15} /> My Profile
                      </Link>
                      <Link to="/orders" className="dropdown-item">
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/wishlist" className="dropdown-item">
                        <Heart size={15} /> Wishlist
                        {wishCount > 0 && <span className="dropdown-count">{wishCount}</span>}
                      </Link>
                      <Link to="/cart" className="dropdown-item">
                        <ShoppingCart size={15} /> My Cart
                        {cartCount > 0 && <span className="dropdown-count">{cartCount}</span>}
                      </Link>
                    </div>
                    {user.isAdmin && (
                      <div className="dropdown-section">
                        <Link to="/admin" className="dropdown-item admin-item">
                          <LayoutDashboard size={15} /> Admin Panel
                        </Link>
                      </div>
                    )}
                    <div className="dropdown-footer">
                      <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login"    className="signin-btn">Sign In</Link>
                <Link to="/register" className="register-btn">Register</Link>
              </div>
            )}

          </div>{/* end navbar-actions */}

          {/* Hamburger — OUTSIDE actions, always last in navbar-inner */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU OVERLAY ── */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>

        {/* Mobile menu header */}
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">
            <span style={{ color: '#e94560' }}>◆</span> Menu
          </span>
          <button
            className="mobile-menu-close"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile search */}
        <form className="mobile-search" onSubmit={handleSearch}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">→</button>
        </form>

        {/* Mobile user info */}
        {user && (
          <div className="mobile-user-info">
            <div className="mobile-user-avatar">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} />
                : <span>{user.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div>
              <div className="mobile-user-name">{user.name}</div>
              <div className="mobile-user-email">{user.email}</div>
            </div>
          </div>
        )}

        {/* Mobile nav links */}
        <div className="mobile-nav">
          <Link to="/"         className="mobile-nav-item"><Home size={16} /> Home</Link>
          <Link to="/products" className="mobile-nav-item"><ShoppingBag size={16} /> All Products</Link>
          <Link to="/cart"     className="mobile-nav-item">
            <ShoppingCart size={16} /> Cart
            {cartCount > 0 && <span className="mobile-badge">{cartCount}</span>}
          </Link>
          <Link to="/wishlist" className="mobile-nav-item">
            <Heart size={16} /> Wishlist
            {wishCount > 0 && <span className="mobile-badge">{wishCount}</span>}
          </Link>
          {user && (
            <>
              <Link to="/orders"  className="mobile-nav-item"><ClipboardList size={16} /> My Orders</Link>
              <Link to="/profile" className="mobile-nav-item"><User size={16} /> Profile</Link>
            </>
          )}
          {user?.isAdmin && (
            <Link to="/admin" className="mobile-nav-item admin-link">
              <LayoutDashboard size={16} /> Admin Panel
            </Link>
          )}
        </div>

        {/* Mobile categories */}
        <div className="mobile-cats-section">
          <div className="mobile-cats-title">Categories</div>
          <div className="mobile-cats-grid">
            {CATEGORIES.map(c => (
              <Link
                key={c.name}
                to={`/products?category=${c.name}`}
                className="mobile-cat-chip"
              >
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Dark mode toggle */}
        <button className="mobile-dark-btn" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        {/* Auth */}
        {user ? (
          <button className="mobile-logout" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        ) : (
          <div className="mobile-auth-btns">
            <Link to="/login"    className="mobile-signin">Sign In</Link>
            <Link to="/register" className="mobile-register">Create Account</Link>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV (mobile only) ── */}
      <div className="bottom-nav">
        <Link to="/" className={`bottom-item ${isActive('/') ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/products" className={`bottom-item ${isActive('/products') ? 'active' : ''}`}>
          <ShoppingBag size={20} />
          <span>Shop</span>
        </Link>
        <Link to="/cart" className={`bottom-item ${isActive('/cart') ? 'active' : ''}`}>
          <div className="bottom-cart-wrap">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="bottom-badge">{cartCount}</span>}
          </div>
          <span>Cart</span>
        </Link>
        <Link to="/orders" className={`bottom-item ${isActive('/orders') ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span>Orders</span>
        </Link>
        <Link
          to={user ? '/profile' : '/login'}
          className={`bottom-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <User size={20} />
          <span>{user ? 'Profile' : 'Login'}</span>
        </Link>
      </div>
</div>
     
    </>
  );
};

export default Navbar;