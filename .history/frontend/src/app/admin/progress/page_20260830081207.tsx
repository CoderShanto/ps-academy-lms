'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, CheckCircle2, Search } from 'lucide-react';

interface ProgressRecord {
  id: number;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  enrolledAt: string;
}

export default function StudentProgressOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    try {
      const { data } = await api.get('/progress/students-overview');
      setRecords(data.data || []);
    } catch (err) {
      console.error('Failed to load progress records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      const roleName = (user?.role?.name || user?.role?.type || '').toLowerCase();
      if (!user) {
        router.push('/login');
      } else if (
        !roleName.includes('admin') &&
        !roleName.includes('instructor') &&
        !roleName.includes('content') &&
        !roleName.includes('manager')
      ) {
        router.push('/student');
      } else {
        fetchOverview();
      }
    }
  }, [user, authLoading, router, fetchOverview]);

  const getStudioBackLink = () => {
    const r = (user?.role?.name || user?.role?.type || '').toLowerCase();
    if (r.includes('instructor')) return '/instructor';
    if (r.includes('admin')) return '/admin';
    if (r.includes('manager') || r.includes('content')) return '/content-manager';
    return '/student';
  };

  const isInstructor = (user?.role?.name || user?.role?.type || '').toLowerCase().includes('instructor');

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredRecords = records.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          href={getStudioBackLink()}
          className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Studio
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isInstructor ? 'My Students Learning Progress' : 'Student Learning Progress'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isInstructor
            ? 'Live tracking of enrolled students and milestones across your courses'
            : 'Live tracking of course completions, enrolled students, and lesson milestones across the platform'}
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex items-center max-w-md">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by student name, email, or course..."
          className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900 text-base">
              {isInstructor ? 'Enrollments in My Courses' : 'All Enrollments & Completion Rates'}
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {filteredRecords.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-white">
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Enrolled Course</th>
                <th className="py-4 px-6">Completed Lessons</th>
                <th className="py-4 px-6">Completion %</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No matching student progress records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{item.studentName}</p>
                      <p className="text-xs text-gray-500">{item.studentEmail}</p>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">{item.courseTitle}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {item.completedLessons} of {item.totalLessons} Lessons
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-36 flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${item.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{item.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.progressPercentage === 100 ? (
                        <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Finished
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}