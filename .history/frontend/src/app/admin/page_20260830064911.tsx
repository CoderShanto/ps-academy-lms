'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  UserCheck,
  FileText,
  Shield,
  Check,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  PenTool,
  UserX,
} from 'lucide-react';
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
  } | null;
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
  usersByRole?: Record<string, number>;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalArticles: 0,
    usersByRole: {
      Student: 0,
      Instructor: 0,
      'Content Manager': 0,
      Admin: 0,
      'No Role / Revoked': 0,
    },
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

  const handleRoleChange = async (userId: number, newRoleId: number | null) => {
    setUpdatingId(userId);
    setStatusMessage('');

    try {
      await api.put(`/admin/users/${userId}/role`, { roleId: newRoleId });
      setStatusMessage(newRoleId ? 'Role updated successfully!' : 'User role removed successfully!');
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

  const roleCounts = metrics.usersByRole || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Navigation */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
        <p className="text-gray-600 mt-1 mb-6">
          Platform metrics, role breakdown, and user role promotion / removal
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-sm"
          >
            User & Roles Management
          </Link>
          <Link
            href="/admin/progress"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-sm font-semibold rounded-xl shadow-sm transition"
          >
            Student Progress Analytics
          </Link>
          <Link
            href="/instructor"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-sm font-semibold rounded-xl shadow-sm transition"
          >
            Course & Quiz Studio
          </Link>
          <Link
            href="/content-manager"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-sm font-semibold rounded-xl shadow-sm transition"
          >
            Blog Studio
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center text-sm font-medium">
          <Check className="h-4 w-4 mr-2 text-emerald-600" />
          {statusMessage}
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalCourses}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Enrollments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalEnrollments}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Published Articles</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalArticles}</p>
          </div>
        </div>
      </div>

      {/* Users Distribution Per Role Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-indigo-600" /> Users Distribution Per Role
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center space-x-3">
            <GraduationCap className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase">Students</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{roleCounts['Student'] || roleCounts['Authenticated'] || 0}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase">Instructors</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{roleCounts['Instructor'] || 0}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex items-center space-x-3">
            <PenTool className="h-6 w-6 text-purple-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-purple-700 uppercase">Content Managers</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{roleCounts['Content Manager'] || 0}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center space-x-3">
            <ShieldCheck className="h-6 w-6 text-rose-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-700 uppercase">Admins</p>
              <p className="text-xl font-black text-gray-900 mt-0.5">{roleCounts['Admin'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Role Assignment & Removal Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Manage Users & Assign / Remove Roles</h2>
          </div>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            {usersList.length} Total Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider bg-white">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Current Role</th>
                <th className="py-4 px-6">Assign / Promote Role</th>
                <th className="py-4 px-6 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {usersList.map((item) => {
                const isCurrentUser = item.username === user?.username;
                const hasRole = Boolean(item.role?.name);

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-semibold text-gray-900">{item.username}</td>
                    <td className="py-4 px-6 text-gray-600">{item.email}</td>
                    <td className="py-4 px-6">
                      {hasRole ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 uppercase">
                          {item.role?.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 uppercase">
                          No Role (Revoked)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={item.role?.id || ''}
                        disabled={updatingId === item.id || isCurrentUser}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleRoleChange(item.id, val === '' ? null : Number(val));
                        }}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 disabled:bg-gray-100"
                      >
                        <option value="">-- No Role (Revoke) --</option>
                        {availableRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {hasRole && !isCurrentUser && (
                        <button
                          onClick={() => handleRoleChange(item.id, null)}
                          disabled={updatingId === item.id}
                          className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition border border-red-200 disabled:opacity-50"
                          title="Remove user role completely"
                        >
                          <UserX className="h-3.5 w-3.5 mr-1" /> Revoke Role
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}