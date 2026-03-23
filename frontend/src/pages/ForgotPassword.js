import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      navigate('/verify-otp', { state: { email, mode: 'reset' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email and we'll send you an OTP</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" className="form-control"
              placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP →'}
          </button>
        </form>
        <p className="auth-footer">
          Remember password? <a href="/login">Sign In →</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;