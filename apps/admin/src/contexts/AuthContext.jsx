'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('asif_admin_token') ||
            localStorage.getItem('mazlis_admin_token') ||
            localStorage.getItem('token')
          : null;

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data } = await api.get('/auth/me');
      if (data?.data?.user) {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.warn('Session check warning:', error?.response?.data?.message || error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { data } = await api.post('/auth/admin/signin', credentials);
    const loggedUser = data.data.user;
    const token = data.data.token;

    setUser(loggedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('asif_admin_token', token);
      localStorage.setItem('mazlis_admin_token', token);
      localStorage.setItem('token', token);

      localStorage.setItem('asif_admin_user', JSON.stringify(loggedUser));
      localStorage.setItem('mazlis_admin_user', JSON.stringify(loggedUser));
      localStorage.setItem('user', JSON.stringify(loggedUser));
    }

    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/signout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('asif_admin_token');
        localStorage.removeItem('mazlis_admin_token');
        localStorage.removeItem('token');
        localStorage.removeItem('asif_admin_user');
        localStorage.removeItem('mazlis_admin_user');
        localStorage.removeItem('user');
      }
      setUser(null);
      router.push('/signin');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};