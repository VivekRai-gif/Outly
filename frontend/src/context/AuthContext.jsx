import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, logoutUser as apiLogout } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('outly_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('outly_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if redirected back from Google OAuth
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const authState = params.get('auth');
      const googleToken = params.get('token');
      const googleUserStr = params.get('user');

      if (authState === 'google_success' && googleToken && googleUserStr) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(googleUserStr));
          setUser(parsedUser);
          setToken(googleToken);
          localStorage.setItem('outly_user', JSON.stringify(parsedUser));
          localStorage.setItem('outly_token', googleToken);

          // Clean URL query parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Failed to parse Google OAuth user payload:', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('outly_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('outly_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('outly_token', token);
    } else {
      localStorage.removeItem('outly_token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Failed to sign in' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Sign in error';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, company) => {
    setLoading(true);
    try {
      const data = await apiRegister({ name, email, password, company });
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration error';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('outly_user');
      localStorage.removeItem('outly_token');
    }
  };

  const quickDemoLogin = () => {
    const demoUser = {
      id: 'demo_user_123',
      name: 'Vivek Rai',
      email: 'vivek@outly.ai',
      company: 'Outly Engine',
      role: 'Growth & Outreach Lead',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vivek',
    };
    setUser(demoUser);
    setToken('demo_token_active');
    return demoUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
