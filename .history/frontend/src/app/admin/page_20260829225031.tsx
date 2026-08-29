'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, UserCheck, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { isAxiosError } from 'axios';

interface Role {
  id: number;
  name: string;
}

interface UserItem {
  id: number;
  username: string;
  email: string;
  role?: Role;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalBlogs: number;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalBlogs: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');

  const fetchAdminData = async () => {
    try {
      // 1. Fetch Users with Roles
      const { data: usersRes } = await api.get('/users?populate=role');
      setUsersList(usersRes || []);

      // 2. Fetch Roles list
      const { data: rolesRes } = await api.get('/users-permissions/roles');
      setRoles(rolesRes.roles || []);

      // 3. Fetch Platform Stats
      const [coursesRes, enrollmentsRes, blogsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/enrollments'),
        api.get('/blog-posts'),
      ]);

      setStats({
        totalUsers: usersRes?.length || 0,
        totalCourses: coursesRes.data?.data?.length || 0,
        totalEnrollments: enrollmentsRes.data?.data?.length || 0,
        totalBlogs: blogsRes.data?.data?.length || 0,
      });
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role?.name !== 'Admin') {
        router.push('/login');
        return;
      }
      fetchAdminData();
    }
  }, [user, authLoading, router]);

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    setUpdatingId(userId);
    setMessage('');
    try {
      await api.put(`/users/${userId}`, {
        role: newRoleId,
      });
      setMessage('User role updated successfully.');
      await fetchAdminData();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.error?.message || 'Failed to update user role');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
        <p className="text-gray-600 mt-1">Platform overview, metrics, and user role management</p>
      </div>

      {message && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Platform Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Courses</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <UserCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Enrollments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Articles</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBlogs}</p>
          </div>
        </div>
      </div>

      {/* User Management & Role Promotion */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">User Role Management</h2>
          </div>
          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {usersList.length} Registered Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 pl-6 font-semibold text-gray-900">{u.username}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        u.role?.name === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role?.name === 'Instructor'
                          ? 'bg-indigo-100 text-indigo-800'
                          : u.role?.name === 'Content Manager'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role?.name || 'Student'}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      disabled={updatingId === u.id || u.id === user?.id}
                      value={u.role?.id || ''}
                      onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-indigo-500 disabled:opacity-50"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}