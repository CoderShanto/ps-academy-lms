'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  role?: {
    id: number;
    name: string;
    type: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchUserWithRole = useCallback(async (token: string) => {
    try {
      let resolvedUser: User | null = null;
      try {
        const { data } = await api.get('/auth/current-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        resolvedUser = data;
      } catch {
        const { data } = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        resolvedUser = data;
      }

      setUser(resolvedUser);
    } catch {
      Cookies.remove('jwt');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = Cookies.get('jwt');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    await fetchUserWithRole(token);
  }, [fetchUserWithRole]);

  useEffect(() => {
    const token = Cookies.get('jwt');
    if (!token) {
      const timeout = setTimeout(() => {
        setUser(null);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timeout);
    }

    fetchUserWithRole(token);
  }, [fetchUserWithRole]);

  const login = (jwt: string, userData: User) => {
    Cookies.set('jwt', jwt, { expires: 7 });
    setUser(userData);

    const rawRole = userData.role?.name || userData.role?.type || '';
    const normalizedRole = rawRole.toLowerCase().trim();

    if (normalizedRole.includes('admin')) {
      router.push('/admin');
    } else if (normalizedRole.includes('instructor')) {
      router.push('/instructor');
    } else if (normalizedRole.includes('manager') || normalizedRole.includes('content')) {
      router.push('/content-manager');
    } else {
      router.push('/student');
    }
  };

  const logout = () => {
    Cookies.remove('jwt');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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