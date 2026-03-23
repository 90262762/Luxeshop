import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import './Admin.css';
import {
  LayoutDashboard, Package, ShoppingCart,
  Users, Tag, TrendingUp, Pencil, Trash2, Plus, Star,
  MessageSquare, RotateCcw,
} from 'lucide-react';
import { exportOrdersToCSV } from '../utils/exportOrders';

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';



const TABS = [
  { label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { label: 'Products',  icon: <Package         size={16} /> },
  { label: 'Orders',    icon: <ShoppingCart    size={16} /> },
  { label: 'Users',     icon: <Users           size={16} /> },
  { label: 'Coupons',   icon: <Tag             size={16} /> },
  { label: 'Contacts',  icon: <MessageSquare   size={16} /> },
  
];

const Admin = () => {
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview,   setImagePreview]   = useState('');
  const fileInputRef = useRef();
  const [form, setForm] = useState({ name:'', price:'', originalPrice:'', description:'', category:'', brand:'', countInStock:'', images:'', featured:false });

  const [chartData,    setChartData]    = useState([]);
  const [chartType,    setChartType]    = useState('revenue');
  const [chartPeriod,  setChartPeriod]  = useState('7days');

  const [coupons,     setCoupons]     = useState([]);
  const [couponForm,  setCouponForm]  = useState({
    code: '', discountType: 'percentage', discountValue: '',
    minOrderValue: '', maxDiscount: '', usageLimit: '',
    expiryDate: '', isActive: true,
  });
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editCoupon,     setEditCoupon]     = useState(null);

  // ── Contacts state ──
  const [contacts,       setContacts]       = useState([]);
  const [contactFilter,  setContactFilter]  = useState('all');
  const [contactLoading, setContactLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // ── Returns state ──
  const [returns,       setReturns]       = useState([]);
  const [returnFilter,  setReturnFilter]  = useState('all');
  const [returnLoading, setReturnLoading] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);


  const generateChartData = (orders, period) => {
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date    = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      data.push({
        date:    dateStr,
        revenue: dayOrders.filter(o => o.isPaid).reduce((a, o) => a + o.totalPrice, 0),
        orders:  dayOrders.length,
        paid:    dayOrders.filter(o => o.isPaid).length,
      });
    }
    return data;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [prodR, orderR, userR, couponR] = await Promise.all([
          API.get('/products?limit=100'),
          API.get('/orders'),
          API.get('/users'),
          API.get('/coupons'),
        ]);
        setProducts(prodR.data.products  || []);
        setOrders(orderR.data            || []);
        setUsers(userR.data              || []);
        setCoupons(couponR.data          || []);
        setChartData(generateChartData(orderR.data || [], chartPeriod));
        const revenue = (orderR.data || []).filter(o => o.isPaid).reduce((a, o) => a + o.totalPrice, 0);
        setStats({
          products: prodR.data.total,
          orders:   orderR.data.length,
          users:    userR.data.length,
          revenue,
        });
      } catch {}
    };
    load();
  }, [tab, chartPeriod]);

  // ── Load contacts when tab is active ──
  useEffect(() => {
    if (tab !== 'Contacts') return;
    const load = async () => {
      setContactLoading(true);
      try {
        const { data } = await API.get('/contact');
        setContacts(data.contacts || []);
      } catch {}
      setContactLoading(false);
    };
    load();
  }, [tab]);

  // ── Load returns when tab is active ──
  useEffect(() => {
    if (tab !== 'Returns') return;
    const load = async () => {
      setReturnLoading(true);
      try {
        const { data } = await API.get('/returns');
        setReturns(data.returns || []);
      } catch {}
      setReturnLoading(false);
    };
    load();
  }, [tab]);

  const handleSaveProduct = async () => {
    const payload = {
      ...form,
      price:         Number(form.price),
      originalPrice: Number(form.originalPrice) || undefined,
      countInStock:  Number(form.countInStock),
      images: uploadedImages.length > 0 ? uploadedImages : (form.images ? [form.images] : []),
    };
    try {
      if (editProd) await API.put(`/products/${editProd._id}`, payload);
      else          await API.post('/products', payload);
      setShowForm(false);
      setEditProd(null);
      setUploadedImages([]);
      setImagePreview('');
      const { data } = await API.get('/products?limit=100');
      setProducts(data.products);
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await API.delete(`/products/${id}`);
    setProducts(p => p.filter(x => x._id !== id));
  };

  const handleOrderStatus = async (id, status) => {
    await API.put(`/orders/${id}/status`, { status });
    setOrders(o => o.map(x => x._id === id ? { ...x, status } : x));
  };

  const openEdit = (p) => {
    setEditProd(p);
    setUploadedImages(p.images || []);
    setImagePreview('');
    setForm({
      name: p.name, price: p.price, originalPrice: p.originalPrice || '',
      description: p.description, category: p.category, brand: p.brand || '',
      countInStock: p.countInStock, images: p.images?.[0] || '', featured: p.featured,
    });
    setShowForm(true);
  };

  // ── Contact helpers ──
  const handleContactStatus = async (id, status) => {
    try {
      await API.put(`/contact/${id}/status`, { status });
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selectedContact?._id === id) setSelectedContact(prev => ({ ...prev, status }));
    } catch {}
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await API.delete(`/contact/${id}`);
      setContacts(prev => prev.filter(c => c._id !== id));
      if (selectedContact?._id === id) setSelectedContact(null);
    } catch {}
  };

  // ── Return helpers ──
  const handleReturnStatus = async (id, status) => {
    try {
      await API.put(`/returns/${id}`, { status });
      setReturns(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      if (selectedReturn?._id === id) setSelectedReturn(prev => ({ ...prev, status }));
    } catch {}
  };

  const filteredContacts = contactFilter === 'all'
    ? contacts
    : contacts.filter(c => c.status === contactFilter);

  const filteredReturns = returnFilter === 'all'
    ? returns
    : returns.filter(r => r.status === returnFilter);

  const contactStatusColor = (s) => ({
    new:     { bg: 'rgba(233,69,96,0.1)',   color: '#e94560' },
    read:    { bg: 'rgba(52,152,219,0.12)', color: '#2980b9' },
    replied: { bg: 'rgba(39,174,96,0.12)',  color: '#27ae60' },
  }[s] || {});

  const returnStatusColor = (s) => ({
    pending:   { bg: 'rgba(243,156,18,0.12)', color: '#e67e22' },
    approved:  { bg: 'rgba(52,152,219,0.12)', color: '#2980b9' },
    rejected:  { bg: 'rgba(231,76,60,0.12)',  color: '#e74c3c' },
    picked_up: { bg: 'rgba(155,89,182,0.12)', color: '#8e44ad' },
    received:  { bg: 'rgba(52,152,219,0.12)', color: '#2980b9' },
    refunded:  { bg: 'rgba(39,174,96,0.12)',  color: '#27ae60' },
    exchanged: { bg: 'rgba(39,174,96,0.12)',  color: '#27ae60' },
  }[s] || {});

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-tabs">
          {TABS.map(t => (
            <button
              key={t.label}
              className={`admin-tab ${tab === t.label ? 'active' : ''}`}
              onClick={() => setTab(t.label)}
            >
              <span className="tab-icon">{t.icon}</span>
              {t.label}
              {/* Badge for new contacts */}
              {t.label === 'Contacts' && contacts.filter(c => c.status === 'new').length > 0 && (
                <span className="tab-badge">{contacts.filter(c => c.status === 'new').length}</span>
              )}
              {/* Badge for pending returns */}
              {t.label === 'Returns' && returns.filter(r => r.status === 'pending').length > 0 && (
                <span className="tab-badge">{returns.filter(r => r.status === 'pending').length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'Dashboard' && (
          <div>
            <div className="stats-grid">
              {[
                { icon: <Package      size={22} />, label: 'Total Products', value: stats.products,                             color: '#667eea' },
                { icon: <ShoppingCart size={22} />, label: 'Total Orders',   value: stats.orders,                               color: '#e94560' },
                { icon: <Users        size={22} />, label: 'Total Users',    value: stats.users,                                color: '#4facfe' },
                { icon: <TrendingUp   size={22} />, label: 'Revenue',        value: `₹ ${(stats.revenue||0).toLocaleString()}`, color: '#43e97b' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
                  <div className="stat-icon-wrap" style={{ '--stat-color': s.color }}>{s.icon}</div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <h3 className="chart-title">📈 Sales Analytics</h3>
                  <p className="chart-sub">Revenue and orders over time</p>
                </div>
                <div className="chart-controls">
                  <div className="chart-toggle">
                    {[{ key: 'revenue', label: 'Revenue' }, { key: 'orders', label: 'Orders' }].map(t => (
                      <button key={t.key} className={`chart-toggle-btn ${chartType === t.key ? 'active' : ''}`} onClick={() => setChartType(t.key)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <select className="chart-period-select" value={chartPeriod} onChange={e => setChartPeriod(e.target.value)}>
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                  </select>
                </div>
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'revenue' ? (
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ece5" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6b8a' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b6b8a' }} tickLine={false} axisLine={false} tickFormatter={v => `₹ ${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                      <Tooltip formatter={(value) => [`₹ ${value.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4dd', fontSize: '12px' }} />
                      <Bar dataKey="revenue" fill="#e94560" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ece5" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6b8a' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b6b8a' }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e8e4dd', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="orders" stroke="#667eea" strokeWidth={2} dot={{ fill: '#667eea', r: 3 }} name="Total Orders" />
                      <Line type="monotone" dataKey="paid"   stroke="#27ae60" strokeWidth={2} dot={{ fill: '#27ae60', r: 3 }} name="Paid Orders" />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="recent-orders">
              <h3>📋 Recent Orders</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o._id}>
                        <td><Link to={`/orders/${o._id}`} style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>#{o._id.slice(-6).toUpperCase()}</Link></td>
                        <td>{o.user?.name || 'N/A'}</td>
                        <td style={{ fontWeight: 700 }}>₹ {o.totalPrice?.toLocaleString()}</td>
                        <td><span className="status-pill" data-status={o.status}>{o.status}</span></td>
                        <td style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'Products' && (
          <div>
            <div className="admin-section-header">
              <h2>Products ({products.length})</h2>
              <button className="btn btn-primary btn-sm" onClick={() => {
                setEditProd(null); setUploadedImages([]); setImagePreview('');
                setForm({ name:'', price:'', originalPrice:'', description:'', category:'', brand:'', countInStock:'', images:'', featured: false });
                setShowForm(true);
              }}>+ Add Product</button>
            </div>

            {showForm && (
              <div className="product-form-overlay">
                <div className="product-form">
                  <div className="form-header">
                    <h3>{editProd ? 'Edit Product' : 'New Product'}</h3>
                    <button onClick={() => setShowForm(false)}>✕</button>
                  </div>
                  {[['name','Name','text'],['price','Price','number'],['originalPrice','Original Price','number'],['category','Category','text'],['brand','Brand','text'],['countInStock','Stock','number']].map(([f,l,t]) => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{l}</label>
                      <input type={t} className="form-control" value={form[f]} onChange={e => setForm({...form,[f]:e.target.value})} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Product Images (max 5)</label>
                    {uploadedImages.length > 0 && (
                      <div className="multi-img-grid">
                        {uploadedImages.map((url, i) => (
                          <div key={i} className="multi-img-item">
                            <img src={url} alt={`product-${i}`} />
                            <button className="multi-img-remove" type="button" onClick={() => {
                              const updated = uploadedImages.filter((_, idx) => idx !== i);
                              setUploadedImages(updated);
                              setForm(f => ({ ...f, images: updated[0] || '' }));
                            }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {uploadedImages.length === 0 && form.images && (
                      <div className="img-preview-wrap"><img src={form.images} alt="current" className="img-preview" /></div>
                    )}
                    {uploadedImages.length < 5 && (
                      <div className="img-upload-area" onClick={() => fileInputRef.current.click()}>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple style={{ display: 'none' }}
                          onChange={async (e) => {
                            const files = Array.from(e.target.files);
                            if (!files.length) return;
                            setImageUploading(true);
                            setImagePreview(URL.createObjectURL(files[0]));
                            try {
                              const formData = new FormData();
                              files.forEach(f => formData.append('images', f));
                              const { data } = await API.post('/products/upload-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                              const newImages = [...uploadedImages, ...data.imageUrls].slice(0, 5);
                              setUploadedImages(newImages);
                              setForm(f => ({ ...f, images: newImages[0] }));
                              setImagePreview('');
                            } catch (err) {
                              alert('Upload failed: ' + (err.response?.data?.message || err.message));
                              setImagePreview('');
                            } finally { setImageUploading(false); e.target.value = ''; }
                          }}
                        />
                        <div className="img-upload-icon">📷</div>
                        <div className="img-upload-text">{imageUploading ? 'Uploading...' : `Click to upload (${uploadedImages.length}/5)`}</div>
                        <div className="img-upload-sub">JPG, PNG or WEBP · Max 10MB</div>
                      </div>
                    )}
                    <div style={{ margin: '0.5rem 0', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)' }}>— or paste URL —</div>
                    <input type="url" className="form-control" placeholder="https://example.com/image.jpg"
                      value={uploadedImages.length === 0 ? form.images : ''}
                      onChange={e => { setForm({ ...form, images: e.target.value }); setUploadedImages([]); setImagePreview(''); }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
                  </div>
                  <label className="featured-check">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({...form,featured:e.target.checked})} />
                    Featured Product
                  </label>
                  <div style={{ display:'flex',gap:'0.75rem',marginTop:'1.25rem' }}>
                    <button className="btn btn-primary" onClick={handleSaveProduct}>Save Product</button>
                    <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td><img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/50/50`} alt={p.name} style={{ width:48,height:48,objectFit:'cover',borderRadius:8 }} /></td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category}</td>
                      <td>₹ {p.price.toLocaleString()}</td>
                      <td><span className={p.countInStock > 0 ? 'in-stock' : 'out-stock'}>{p.countInStock}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn edit-btn" onClick={() => openEdit(p)}>✏️ Edit</button>
                          <button className="action-btn delete-btn" onClick={() => handleDeleteProduct(p._id)}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Orders' && (
          <div>
            <div className="admin-section-header">
              <h2>🛒 All Orders <span style={{ color: 'var(--text-light)', fontWeight: 400, fontSize: '0.95rem' }}>({orders.length})</span></h2>
              <button className="btn btn-outline btn-sm" onClick={() => exportOrdersToCSV(orders)}>📥 Export Excel</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Customer</th><th>Amount</th><th>Paid</th><th>Status</th><th>Return</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td><Link to={`/orders/${o._id}`} style={{ color:'var(--accent)' }}>#{o._id.slice(-6).toUpperCase()}</Link></td>
                      <td>{o.user?.name || 'N/A'}</td>
                      <td>₹ {o.totalPrice?.toLocaleString()}</td>
                      <td><span style={{ color: o.isPaid ? 'var(--success)' : 'var(--danger)', fontWeight:600 }}>{o.isPaid ? '✓ Paid' : '✕'}</span></td>
                      <td>
                        <select className="status-select" value={o.status} onChange={e => handleOrderStatus(o._id, e.target.value)}>
                          {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        {o.returnRequested ? (
                          <select className="status-select" value={o.returnStatus}
                            onChange={async (e) => {
                              await API.put(`/orders/${o._id}/return-status`, { returnStatus: e.target.value });
                              setOrders(prev => prev.map(x => x._id === o._id ? { ...x, returnStatus: e.target.value } : x));
                            }}>
                            <option value="requested">Requested</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>None</span>
                        )}
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Users' && (
          <div>
            <div className="admin-section-header">
              <h2>👥 All Users <span style={{ color: 'var(--text-light)', fontWeight: 400, fontSize: '0.95rem' }}>({users.length})</span></h2>
            </div>
            <div className="admin-search-wrap">
              <input type="text" className="form-control admin-search-input" placeholder="🔍 Search by name or email..."
                value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              {userSearch && <button className="admin-search-clear" onClick={() => setUserSearch('')}>✕</button>}
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.filter(u =>
                    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.email?.toLowerCase().includes(userSearch.toLowerCase())
                  ).map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),#667eea)',color:'white',fontWeight:700,fontSize:'0.85rem',display:'flex',alignItems:'center',justifyContent:'center' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{u.email}</td>
                      <td>
                       <span style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: '0.28rem 0.75rem',
  borderRadius: '50px',
  fontSize: '0.74rem',
  fontWeight: 700,
  whiteSpace: 'nowrap',
  background: u.isAdmin ? 'rgba(233,69,96,0.1)' : 'rgba(26,26,46,0.07)',
  color: u.isAdmin ? 'var(--accent)' : 'var(--text-light)',
}}>
  {u.isAdmin ? '⭐ Admin' : '👤 User'}
</span>
                      </td>
                      <td style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}</td>
                      <td>
                        <div className="action-btns admin-action-btns">
                          <button className="action-btn edit-btn admin-edit-btn" onClick={async () => {
                            if (!window.confirm(`Make ${u.name} ${u.isAdmin ? 'regular user' : 'admin'}?`)) return;
                            try {
                              await API.put(`/users/${u._id}`, { isAdmin: !u.isAdmin });
                              setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isAdmin: !u.isAdmin } : x));
                            } catch (err) { alert(err.response?.data?.message || 'Error'); }
                          }}>{u.isAdmin ? '👤 Remove' : '⭐ Make Admin'}</button>
                          <button className="action-btn delete-btn admin-delete-btn" onClick={async () => {
                            if (!window.confirm(`Delete ${u.name}?`)) return;
                            try {
                              await API.delete(`/users/${u._id}`);
                              setUsers(prev => prev.filter(x => x._id !== u._id));
                            } catch (err) { alert(err.response?.data?.message || 'Error'); }
                          }}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Coupons' && (
          <div>
            <div className="admin-section-header">
              <h2>🎟 Coupons <span style={{ color: 'var(--text-light)', fontWeight: 400, fontSize: '0.95rem' }}>({coupons.length})</span></h2>
              <button className="btn btn-primary btn-sm" onClick={() => {
                setEditCoupon(null);
                setCouponForm({ code:'',discountType:'percentage',discountValue:'',minOrderValue:'',maxDiscount:'',usageLimit:'',expiryDate:'',isActive:true });
                setShowCouponForm(true);
              }}>+ Add Coupon</button>
            </div>
            {showCouponForm && (
              <div className="product-form-overlay">
                <div className="product-form">
                  <div className="form-header">
                    <h3>{editCoupon ? '✏️ Edit Coupon' : '➕ New Coupon'}</h3>
                    <button onClick={() => setShowCouponForm(false)}>✕</button>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Coupon Code</label>
                    <input className="form-control" placeholder="e.g. SAVE20" style={{ textTransform:'uppercase' }}
                      value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select className="form-control" value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Value ({couponForm.discountType === 'percentage' ? '%' : '₹'})</label>
                    <input type="number" className="form-control" value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })} />
                  </div>
                  {couponForm.discountType === 'percentage' && (
                    <div className="form-group">
                      <label className="form-label">Max Discount (₹) — optional</label>
                      <input type="number" className="form-control" value={couponForm.maxDiscount} onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Minimum Order Value (₹)</label>
                    <input type="number" className="form-control" value={couponForm.minOrderValue} onChange={e => setCouponForm({ ...couponForm, minOrderValue: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Usage Limit — optional</label>
                    <input type="number" className="form-control" value={couponForm.usageLimit} onChange={e => setCouponForm({ ...couponForm, usageLimit: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date — optional</label>
                    <input type="date" className="form-control" value={couponForm.expiryDate} onChange={e => setCouponForm({ ...couponForm, expiryDate: e.target.value })} />
                  </div>
                  <label className="featured-check">
                    <input type="checkbox" checked={couponForm.isActive} onChange={e => setCouponForm({ ...couponForm, isActive: e.target.checked })} />
                    Active
                  </label>
                  <div style={{ display:'flex',gap:'0.75rem',marginTop:'1.5rem' }}>
                    <button className="btn btn-primary" onClick={async () => {
                      try {
                        const payload = { ...couponForm, discountValue: Number(couponForm.discountValue), minOrderValue: Number(couponForm.minOrderValue)||0, maxDiscount: couponForm.maxDiscount?Number(couponForm.maxDiscount):null, usageLimit: couponForm.usageLimit?Number(couponForm.usageLimit):null, expiryDate: couponForm.expiryDate||null };
                        if (editCoupon) await API.put(`/coupons/${editCoupon._id}`, payload);
                        else await API.post('/coupons', payload);
                        const { data } = await API.get('/coupons');
                        setCoupons(data); setShowCouponForm(false);
                      } catch (err) { alert(err.response?.data?.message || 'Error'); }
                    }}>{editCoupon ? '💾 Update' : '➕ Create'}</button>
                    <button className="btn btn-outline" onClick={() => setShowCouponForm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c._id}>
                      <td><span style={{ background:'var(--primary)',color:'white',padding:'0.2rem 0.6rem',borderRadius:'4px',fontSize:'0.82rem',fontWeight:700 }}>{c.code}</span></td>
                      <td style={{ fontSize:'0.85rem' }}>{c.discountType === 'percentage' ? '% Percent' : '₹ Fixed'}</td>
                      <td style={{ fontWeight:700 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹ ${c.discountValue}`}{c.maxDiscount ? ` (max ₹ ${c.maxDiscount})` : ''}</td>
                      <td>₹ {c.minOrderValue}</td>
                      <td>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                      <td style={{ fontSize:'0.82rem',color:'var(--text-light)' }}>{c.expiryDate ? new Date(c.expiryDate) < new Date() ? <span style={{ color:'var(--danger)' }}>Expired</span> : new Date(c.expiryDate).toLocaleDateString() : 'Never'}</td>
                      <td><span style={{ padding:'0.2rem 0.65rem',borderRadius:'50px',fontSize:'0.75rem',fontWeight:700,background:c.isActive?'rgba(39,174,96,0.1)':'rgba(231,76,60,0.1)',color:c.isActive?'var(--success)':'var(--danger)' }}>{c.isActive ? '● Active' : '● Inactive'}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn edit-btn" onClick={() => { setEditCoupon(c); setCouponForm({ code:c.code,discountType:c.discountType,discountValue:c.discountValue,minOrderValue:c.minOrderValue,maxDiscount:c.maxDiscount||'',usageLimit:c.usageLimit||'',expiryDate:c.expiryDate?new Date(c.expiryDate).toISOString().split('T')[0]:'',isActive:c.isActive }); setShowCouponForm(true); }}>✏️ Edit</button>
                          <button className="action-btn delete-btn" onClick={async () => { if (!window.confirm('Delete?')) return; await API.delete(`/coupons/${c._id}`); setCoupons(prev => prev.filter(x => x._id !== c._id)); }}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center',padding:'2rem',color:'var(--text-light)' }}>No coupons yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            CONTACTS TAB
        ══════════════════════════════════════════ */}
        {tab === 'Contacts' && (
          <div>
            <div className="admin-section-header">
              <h2>💬 Contact Messages <span style={{ color:'var(--text-light)',fontWeight:400,fontSize:'0.95rem' }}>({contacts.length})</span></h2>
            </div>

            {/* Filter pills */}
            <div className="admin-filter-pills">
              {['all','new','read','replied'].map(f => (
                <button key={f} className={`filter-pill ${contactFilter === f ? 'active' : ''}`} onClick={() => setContactFilter(f)}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="filter-pill-count">
                    {f === 'all' ? contacts.length : contacts.filter(c => c.status === f).length}
                  </span>
                </button>
              ))}
            </div>

            {contactLoading ? (
              <div className="admin-loading">Loading messages...</div>
            ) : (
              <div className="contact-layout">
                {/* List */}
                <div className="contact-list">
                  {filteredContacts.length === 0 && (
                    <div className="admin-empty">No messages found.</div>
                  )}
                  {filteredContacts.map(c => (
                    <div
                      key={c._id}
                      className={`contact-item ${selectedContact?._id === c._id ? 'active' : ''} ${c.status === 'new' ? 'unread' : ''}`}
                      onClick={() => {
                        setSelectedContact(c);
                        if (c.status === 'new') handleContactStatus(c._id, 'read');
                      }}
                    >
                      <div className="contact-item-avatar">{c.name?.[0]?.toUpperCase()}</div>
                      <div className="contact-item-body">
                        <div className="contact-item-top">
                          <span className="contact-item-name">{c.name}</span>
                          <span className="contact-item-time">{new Date(c.createdAt).toLocaleDateString('en-IN', { day:'numeric',month:'short' })}</span>
                        </div>
                        <div className="contact-item-subject">{c.subject}</div>
                        <div className="contact-item-preview">{c.message}</div>
                      </div>
                      {c.status === 'new' && <div className="contact-unread-dot" />}
                    </div>
                  ))}
                </div>

                {/* Detail panel */}
                {selectedContact ? (
                  <div className="contact-detail">
                    <div className="contact-detail-header">
                      <div>
                        <div className="contact-detail-name">{selectedContact.name}</div>
                        <a href={`mailto:${selectedContact.email}`} className="contact-detail-email">{selectedContact.email}</a>
                      </div>
                      <span className="status-badge" style={{ background: contactStatusColor(selectedContact.status).bg, color: contactStatusColor(selectedContact.status).color }}>
                        {selectedContact.status}
                      </span>
                    </div>

                    <div className="contact-detail-meta">
                      <span>📌 {selectedContact.subject}</span>
                      <span>🕐 {new Date(selectedContact.createdAt).toLocaleString('en-IN', { day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' })}</span>
                    </div>

                    <div className="contact-detail-message">{selectedContact.message}</div>

                    <div className="contact-detail-actions">
                      <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                        className="btn btn-primary btn-sm"
                        onClick={() => handleContactStatus(selectedContact._id, 'replied')}>
                        ✉️ Reply via Email
                      </a>
                      <select className="status-select"
                        value={selectedContact.status}
                        onChange={e => handleContactStatus(selectedContact._id, e.target.value)}>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>
                      <button className="action-btn delete-btn" style={{ padding:'0.45rem 0.9rem' }}
                        onClick={() => handleDeleteContact(selectedContact._id)}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="contact-detail contact-detail-empty">
                    <div>💬</div>
                    <p>Select a message to view details</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            RETURNS TAB
        ══════════════════════════════════════════ */}
        

      </div>
    </div>
  );
};

export default Admin;