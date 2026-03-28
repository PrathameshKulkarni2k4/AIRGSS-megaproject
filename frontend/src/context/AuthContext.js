import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  // FIX: Track initial token verification so app doesn't flash login screen
  const [initializing, setInitializing] = useState(true);

  // FIX: Verify token on every app load — if token expired, clear state and redirect to login
  // Without this, user stays visually logged in but all API calls return 401
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        // Refresh user data from server (picks up any role/profile changes)
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      } catch {
        // Token invalid or expired — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      return { success: true, user: data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed. Please check your credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  // FIX: Show nothing while verifying token to prevent flash of login screen
  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A1628' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
          <p style={{ opacity: 0.6 }}>Loading AIRGSS...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
