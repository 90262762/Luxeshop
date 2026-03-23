import { useState, useEffect } from 'react';

const MAX_ITEMS = 5;
const KEY       = 'recentlyViewed';

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setRecentlyViewed(JSON.parse(stored));
    } catch {}
  }, []);

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p._id !== product._id);
      // Add to front, keep max 5
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    localStorage.removeItem(KEY);
    setRecentlyViewed([]);
  };

  return { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed };
};