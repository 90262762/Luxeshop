import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './Profile.css';

const Profile = () => {
  const { user, login } = useAuth();

  // ── Form state ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:     user?.name  || '',
    email:    user?.email || '',
    password: '',
    confirm:  '',
  });

  // Pre-fill address from saved user data
  const [address, setAddress] = useState({
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || '',
    state:   user?.address?.state   || '',
    zip:     user?.address?.zip     || '',
    country: user?.address?.country || 'India',
  });

  // ── Avatar state ─────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [uploading, setUploading]         = useState(false);
  const [avatarMsg, setAvatarMsg]         = useState('');
  const [avatarError, setAvatarError]     = useState('');
  const fileRef = useRef();

  // ── General state ────────────────────────────────────────────────
  const [msg, setMsg]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [addrMsg, setAddrMsg]   = useState('');
  const [addrErr, setAddrErr]   = useState('');
  const [addrLoad, setAddrLoad] = useState(false);
  const [tab, setTab]           = useState('profile');

  // ── Avatar upload ────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setAvatarError('Only JPG, PNG or WEBP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5MB.');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError('');
    setAvatarMsg('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await API.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      login({ ...user, avatar: data.avatar });
      setAvatarMsg('Profile photo updated!');
    } catch (err) {
      const m = err.response?.data?.message || err.message || 'Upload failed';
      setAvatarError(typeof m === 'string' ? m : 'Upload failed');
      setAvatarPreview(user?.avatar || '');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ── Profile info save ────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (form.password && form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await API.put('/auth/profile', payload);
      login({ ...user, ...data, token: data.token });
      setMsg('Profile updated successfully!');
      setForm(f => ({ ...f, password: '', confirm: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Address save ─────────────────────────────────────────────────
  const handleAddressSave = async (e) => {
    e.preventDefault();
    setAddrMsg(''); setAddrErr('');

    // Basic validation
    if (!address.street || !address.city || !address.state || !address.zip) {
      return setAddrErr('Please fill in all address fields.');
    }

    setAddrLoad(true);
    try {
      const { data } = await API.put('/auth/profile', { address });
      login({ ...user, address: data.address });
      setAddrMsg('Address saved successfully!');
    } catch (err) {
      setAddrErr(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setAddrLoad(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">

          {/* ── Sidebar ── */}
          <div className="profile-sidebar">
            <div className="avatar-upload-wrap">
              <div className="profile-avatar-big">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', borderRadius: '50%',
                    }}
                  />
                ) : (
                  <span>{user?.name?.[0]?.toUpperCase()}</span>
                )}
                <div
                  className="avatar-overlay"
                  onClick={() => !uploading && fileRef.current.click()}
                >
                  {uploading ? '⏳' : '📷'}
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />

              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                onClick={() => fileRef.current.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '📷 Change Photo'}
              </button>

              {avatarMsg && (
                <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  ✓ {avatarMsg}
                </p>
              )}
              {avatarError && (
                <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  ✕ {avatarError}
                </p>
              )}
              <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.4rem' }}>
                JPG, PNG or WEBP · Max 5MB
              </p>
            </div>

            <h2 style={{ marginTop: '1rem' }}>{user?.name}</h2>
            <p>{user?.email}</p>
            {user?.isAdmin && (
              <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>Admin</span>
            )}

            <div className="profile-nav">
              <button
                className={tab === 'profile' ? 'active' : ''}
                onClick={() => setTab('profile')}
              >
                👤 My Profile
              </button>
              <button
                className={tab === 'address' ? 'active' : ''}
                onClick={() => setTab('address')}
              >
                📍 Address
              </button>
            </div>
          </div>

          {/* ── Main ── */}
          <div className="profile-main">

            {/* Profile Tab */}
            {tab === 'profile' && (
              <div className="profile-card">
                <h3>Personal Information</h3>
                {msg   && <div className="alert alert-success">{msg}</div>}
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSave}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Leave blank to keep current"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Repeat new password"
                        value={form.confirm}
                        onChange={e => setForm({ ...form, confirm: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Address Tab */}
            {tab === 'address' && (
              <div className="profile-card">
                <h3>Saved Address</h3>

                {addrMsg && <div className="alert alert-success">{addrMsg}</div>}
                {addrErr && <div className="alert alert-error">{addrErr}</div>}

                <form onSubmit={handleAddressSave}>
                  <div className="form-row">
                    {/* Full width street */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Street Address</label>
                      <input
                        className="form-control"
                        value={address.street}
                        onChange={e => setAddress({ ...address, street: e.target.value })}
                        placeholder="123 Main Street, Apartment 4B"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        className="form-control"
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        placeholder="Mumbai"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        className="form-control"
                        value={address.state}
                        onChange={e => setAddress({ ...address, state: e.target.value })}
                        placeholder="Maharashtra"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">ZIP / PIN Code</label>
                      <input
                        className="form-control"
                        value={address.zip}
                        onChange={e => setAddress({ ...address, zip: e.target.value })}
                        placeholder="400001"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <select
                        className="form-control"
                        value={address.country}
                        onChange={e => setAddress({ ...address, country: e.target.value })}
                      >
                        {['India', 'USA', 'UK', 'Canada', 'Australia'].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address preview box */}
                  {address.street && (
                    <div className="address-preview">
                      <p className="address-preview-label">📍 Preview</p>
                      <p>
                        {address.street}<br />
                        {address.city}{address.state ? `, ${address.state}` : ''} — {address.zip}<br />
                        {address.country}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addrLoad}
                  >
                    {addrLoad ? 'Saving...' : '📍 Save Address'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;