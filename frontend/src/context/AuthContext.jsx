import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const ROLE_DASHBOARDS = {
  admin: '/dashboards/admin',
  inventory_manager: '/dashboards/inventory',
  sales_manager: '/dashboards/sales',
  support_staff: '/dashboards/support',
  analyst: '/dashboards/analyst',
};

export const ROLE_LABELS = {
  admin: 'System Administrator',
  inventory_manager: 'Inventory & Supply Manager',
  sales_manager: 'Omnichannel Sales Manager',
  support_staff: 'Customer Experience Lead',
  analyst: 'Business Intelligence Analyst',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const getDashboardPath = (role = user?.role) => {
    return ROLE_DASHBOARDS[role] || '/dashboards/admin';
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        getDashboardPath,
        hasRole,
        isAuthenticated: !!user,
        role: user?.role,
        roleLabel: user?.role ? ROLE_LABELS[user.role] : '',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
