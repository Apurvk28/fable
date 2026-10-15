import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication on application mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      if (response?.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 Unauthorized simply means visitor has no active session
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await authApi.register({ name, email, password });
      setUser(response.user);
      return response.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      sessionStorage.setItem('fable_logged_out', 'true');
      await authApi.logout();
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
