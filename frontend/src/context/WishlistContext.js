import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be inside WishlistProvider');
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user }   = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(false);

  // Only fetch when user is logged in AND has a token
  useEffect(() => {
    if (user?.token) {
      fetchWishlist();
    } else {
      setWishlist([]); // clear wishlist on logout
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/wishlist');
      setWishlist(data);
    } catch (err) {
      // Only log if it's not a 401 — 401 just means not logged in yet
      if (err.response?.status !== 401) {
        console.error('Fetch wishlist error:', err.message);
      }
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!user?.token) return;
    try {
      await API.post(`/wishlist/${product._id}`);
      setWishlist(prev => [...prev, product]);

      
    } catch (err) {
      console.error('Add wishlist error:', err.message);
    }

    
  };

  const removeFromWishlist = async (productId) => {
    if (!user?.token) return;
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Remove wishlist error:', err.message);
    }
  };

  const toggleWishlist = async (product) => {
    if (!user?.token) return;
    if (isWishlisted(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product);
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some(p => p._id === productId);
  };

  const clearWishlist = async () => {
    if (!user?.token) return;
    try {
      await API.delete('/wishlist');
      setWishlist([]);
    } catch (err) {
      console.error('Clear wishlist error:', err.message);
    }
  };

  const wishCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist, loading, wishCount,
      addToWishlist, removeFromWishlist,
      toggleWishlist, isWishlisted, clearWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

