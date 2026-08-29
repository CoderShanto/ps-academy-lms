'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, UserCheck, FileText, Shield, Check } from 'lucide-react';
import { isAxiosError } from 'axios';

interface UserItem {
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

interface RoleItem {
  id: number;
  name: string;
  type: string;
}

interface Metrics {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalArticles: number;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalArticles: 0,
  });

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchAdminData = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/overview');
      if (data.metrics) setMetrics(data.metrics);
      if (data.users) setUsersList(data.users);
      if (data.roles) setAvailableRoles(data.roles);
    } catch (err: unknown) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      const roleName = user?.role?.name?.toLowerCase() || user?.role?.type?.toLowerCase() || '';
      if (!user) {
        router.push('/login');
      } else if (!roleName.includes('admin')) {
        router.push('/student');
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, router, fetchAdminData]);

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    setUpdatingId(userId);
    setStatusMessage('');

    try {
      await api.put(`/admin/users/${userId}/role`, { roleId: newRoleId });
      setStatusMessage('Role updated successfully!');
      await fetchAdminData();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.error?.message || 'Failed to update role');
      } else {
        alert('Failed to update role');
      }
    } finally {
      setUpdatingId(null);
      setTimeout(() => setStatusMessage(''), 3000);
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

      {statusMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center text-sm font-medium">
          <Check className="h-4 w-4 mr-2 text-emerald-600" />
          {statusMessage}
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Courses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalCourses}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalEnrollments}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Articles</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalArticles}</p>
          </div>
        </div>
      </div>

      {/* User Role Management Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">User Role Management</h2>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            {usersList.length} Registered Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Current Role</th>
                <th className="py-4 px-6">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {usersList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-semibold text-gray-900">{item.username}</td>
                  <td className="py-4 px-6 text-gray-600">{item.email}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 uppercase">
                      {item.role?.name || 'Student'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={item.role?.id || ''}
                      disabled={updatingId === item.id || item.username === user?.username}
                      onChange={(e) => handleRoleChange(item.id, Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-100"
                    >
                      {availableRoles.map((r) => (
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