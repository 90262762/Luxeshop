import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './OTPVerify.css';

const OTPVerify = () => {
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const email = location.state?.email || '';
  const mode  = location.state?.mode  || 'verify'; // 'verify' | 'reset'

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last digit
    setOtp(newOtp);
    setError('');

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move back on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return setError('Please enter all 6 digits');
    }

    setLoading(true); setError('');
    try {
      const endpoint = mode === 'reset' ? '/auth/verify-otp' : '/auth/verify-otp';
      const { data } = await API.post(endpoint, { email, otp: otpString });

      setSuccess('✓ Verified successfully!');

      if (mode === 'reset') {
        setTimeout(() => navigate('/reset-password', { state: { email, verified: true } }), 1000);
      } else {
        login(data);
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      // Shake animation on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setError(''); setSuccess('');
    try {
      await API.post('/auth/resend-otp', { email });
      setSuccess('New OTP sent to your email!');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-card">

        {/* Header */}
        <div className="otp-header">
          <div className="otp-icon-wrap">
            <span className="otp-icon">✉️</span>
          </div>
          <h1>Verify Your Email</h1>
          <p>
            We sent a 6-digit OTP to<br />
            <strong>{email}</strong>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`otp-input ${digit ? 'filled' : ''} ${error ? 'error' : ''}`}
            />
          ))}
        </div>

        {/* Messages */}
        {error   && <div className="otp-error">  ✕ {error}  </div>}
        {success && <div className="otp-success"> {success} </div>}

        {/* Verify button */}
        <button
          className="btn btn-primary btn-block otp-btn"
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify OTP →'}
        </button>

        {/* Resend */}
        <div className="otp-resend">
          {canResend ? (
            <button
              className="resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Sending...' : '🔄 Resend OTP'}
            </button>
          ) : (
            <p>Resend OTP in <strong>{countdown}s</strong></p>
          )}
        </div>

        <button className="otp-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    </div>
  );
};

export default OTPVerify;