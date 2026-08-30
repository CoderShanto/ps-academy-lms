'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { isAxiosError } from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/local', {
        identifier,
        password,
      });

      const { jwt, user: initialUser } = res.data;

      // Fetch user with fully populated role
      let userWithRole = initialUser;
      try {
        const { data } = await api.get('/auth/current-user', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        userWithRole = data;
      } catch {
        userWithRole = initialUser;
      }

      login(jwt, userWithRole);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error?.message || 'Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new student account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email or Username</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="manager@lms.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}