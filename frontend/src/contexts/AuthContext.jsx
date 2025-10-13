import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem('token', token);
      checkAuth();
    } else {
      setAuthToken(null);
      localStorage.removeItem('token');
      setLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await api.login({ username, password });
    // Debugging: ensure we received an access token
    console.log('Auth login response:', response);
    if (!response || !response.access_token) {
      throw new Error('Login did not return an access token');
    }

    // Save token to both localStorage (when available) and in-memory API token
    setAuthToken(response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response;
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    return response;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};