import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user }  = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const intervalRef = useRef(null);

  // Fetch on login/logout
  useEffect(() => {
    if (user?.token) {
      fetchNotifications();
      startPolling();
    } else {
      setNotifications([]);
      stopPolling();
    }

    return () => stopPolling();
  }, [user]);

  // Poll every 30 seconds for new notifications
  const startPolling = () => {
    stopPolling(); // clear any existing interval
    intervalRef.current = setInterval(() => {
      fetchNotifications(true); // silent fetch — no loading spinner
    }, 30000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch {}
    finally { if (!silent) setLoading(false); }
  };

  const markRead = async (id) => {
    // ✅ Update UI instantly — don't wait for API
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    try {
      await API.put(`/notifications/${id}/read`);
    } catch {}
  };

  const markAllRead = async () => {
    // ✅ Update UI instantly
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await API.put('/notifications/read-all');
    } catch {}
  };

  const deleteNotification = async (id) => {
    // ✅ Update UI instantly
    setNotifications(prev => prev.filter(n => n._id !== id));
    try {
      await API.delete(`/notifications/${id}`);
    } catch {}
  };

  // ✅ Call this after placing order, cancelling etc
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications, loading, unreadCount,
      fetchNotifications, markRead, markAllRead,
      deleteNotification, addNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};