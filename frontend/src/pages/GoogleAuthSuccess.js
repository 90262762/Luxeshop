import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { login }      = useAuth();
  const navigate       = useNavigate();

  useEffect(() => {
    const userData = searchParams.get('user');
    if (userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        login(user);
        navigate('/');
      } catch {
        navigate('/login?error=google');
      }
    } else {
      navigate('/login?error=google');
    }
  }, []);

  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  );
};

export default GoogleAuthSuccess;