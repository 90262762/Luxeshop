import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';
import './Auth.css';

const ResetPassword = () => {
  const [form, setForm] = useState({ otp: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();
  const email     = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        email, otp: form.otp, newPassword: form.password,
      });
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter the OTP sent to <strong>{email}</strong></p>
        </div>
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">OTP Code</label>
            <input
              className="form-control" placeholder="Enter 6-digit OTP"
              value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })}
              maxLength={6} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password" className="form-control" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password" className="form-control" placeholder="Repeat password"
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;