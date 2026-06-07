import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverWaking, setServerWaking] = useState(false);

  // Load user profile on startup and wake up server
  useEffect(() => {
    const fetchUserAndWakeServer = async () => {
      setLoading(true);
      
      // If server doesn't respond in 1.5 seconds, flag it as waking up
      const wakeupTimer = setTimeout(() => {
        setServerWaking(true);
      }, 1500);

      try {
        // Ping root to trigger backend wakeup if sleeping
        await api.get('/');
        clearTimeout(wakeupTimer);
        setServerWaking(false);

        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const res = await api.get('/settings/me');
            setUser(res.data);
          } catch (err) {
            console.error("Failed to load user session", err);
            logout();
          }
        }
      } catch (err) {
        console.error("Failed to wake server or complete check", err);
      } finally {
        clearTimeout(wakeupTimer);
        setServerWaking(false);
        setLoading(false);
      }
    };
    fetchUserAndWakeServer();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Fetch user details immediately after login
      const userRes = await api.get('/settings/me');
      setUser(userRes.data);
      return userRes.data;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    const res = await api.post('/auth/verify-email', { token });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (token, new_password) => {
    const res = await api.post('/auth/reset-password', { token, new_password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateProfile = async (name, email) => {
    const res = await api.put('/settings/profile', { name, email });
    setUser(res.data);
    return res.data;
  };

  const updatePassword = async (current_password, new_password) => {
    const res = await api.put('/settings/password', { current_password, new_password });
    return res.data;
  };

  const deleteAccount = async () => {
    const res = await api.delete('/settings/account');
    logout();
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        serverWaking,
        login,
        register,
        verifyEmail,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        updatePassword,
        deleteAccount,
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
export default AuthContext;
