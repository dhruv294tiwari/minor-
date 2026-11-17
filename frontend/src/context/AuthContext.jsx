import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('mait_admin_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mait_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('mait_admin_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setAdmin(res.data);
          localStorage.setItem('mait_admin_profile', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (username, password) => {
    const response = await authApi.login({ username, password });
    const { access_token, admin: adminData } = response.data;
    localStorage.setItem('mait_admin_token', access_token);
    localStorage.setItem('mait_admin_profile', JSON.stringify(adminData));
    setToken(access_token);
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('mait_admin_token');
    localStorage.removeItem('mait_admin_profile');
    setToken(null);
    setAdmin(null);
  };

  const updateAdminState = (newAdminData) => {
    localStorage.setItem('mait_admin_profile', JSON.stringify(newAdminData));
    setAdmin(newAdminData);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        login,
        logout,
        updateAdminState,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
