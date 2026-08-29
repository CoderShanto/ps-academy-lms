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

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const { data } = await api.get('/users/me?populate=*', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
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
    await fetchCurrentUser(token);
  }, [fetchCurrentUser]);

  useEffect(() => {
    let isMounted = true;
    const token = Cookies.get('jwt');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data } = await api.get('/users/me?populate=*', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setUser(data);
        }
      } catch {
        if (isMounted) {
          Cookies.remove('jwt');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (jwt: string, userData: User) => {
    Cookies.set('jwt', jwt, { expires: 7 });
    setUser(userData);

    const rawRole = userData.role?.name || userData.role?.type || '';
    const roleName = rawRole.toLowerCase().trim();

    if (roleName.includes('admin')) {
      router.push('/admin');
    } else if (roleName.includes('instructor')) {
      router.push('/instructor');
    } else if (roleName.includes('manager') || roleName.includes('content')) {
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