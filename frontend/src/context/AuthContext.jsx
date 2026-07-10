import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to restore user session:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter(n => !n.isRead).length || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token) {
      setAuthToken(token);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        // Refresh profile in background
        fetchCurrentUser();
      } else {
        fetchCurrentUser();
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Poll for notifications if logged in
  useEffect(() => {
    let interval;
    if (user) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    }
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      setAuthToken(data.token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      await fetchNotifications();
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', userData);
      setAuthToken(data.token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      await fetchNotifications();
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePhoto = async (formData) => {
    setLoading(true);
    try {
      const data = await api.patch('/auth/profile-photo', formData);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    refreshUser: fetchCurrentUser,
    updateProfilePhoto,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
