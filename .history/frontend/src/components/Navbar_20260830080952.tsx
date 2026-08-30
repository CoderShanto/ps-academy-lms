'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, BookOpen, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  // Helper to resolve normalized role name
  const getRoleName = () => {
    const rawRole = user?.role?.name || user?.role?.type || '';
    const normalized = rawRole.toLowerCase().trim();

    if (normalized.includes('admin')) return 'Admin';
    if (normalized.includes('instructor')) return 'Instructor';
    if (normalized.includes('manager') || normalized.includes('content')) return 'Content Manager';
    return user ? 'Student' : '';
  };

const getDashboardHref = () => {
    if (!user) return '/login';
    const r = (user.role?.name || user.role?.type || '').toLowerCase();
    if (r.includes('admin')) return '/admin';
    if (r.includes('instructor')) return '/instructor';
    if (r.includes('manager') || r.includes('content')) return '/content-manager';
    return '/student';
  };
  const currentRole = getRoleName();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900">PS Academy LMS</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link
                href="/courses"
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Courses
              </Link>
              <Link
                href="/blogs"
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Blog
              </Link>
              {user && (
                <Link
                  href={getDashboardHref()}
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex items-center space-x-1 border border-gray-200">
                  <UserIcon className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{user.username}</span>
                  <span className="text-xs text-indigo-600 font-bold uppercase ml-1">
                    ({currentRole})
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}