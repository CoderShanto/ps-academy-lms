'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BookOpen, Award, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchEnrolledCourses = async () => {
      try {
        const { data } = await api.get('/my-courses');
        setCourses(data.data || []);
      } catch {
        // Fallback: try fetching all courses if custom route is syncing
        try {
          const { data } = await api.get('/courses?populate=*');
          setCourses(data.data || []);
        } catch (fallbackErr) {
          console.warn('Could not load course list:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrolledCourses();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your enrolled courses and progress</p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          Browse More Courses
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600 font-medium">You haven&apos;t enrolled in any courses yet.</p>
          <Link href="/courses" className="mt-2 inline-block text-indigo-600 hover:underline">
            Explore Course Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Award className="h-6 w-6" />
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{course.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{course.description}</p>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Link
                  href={`/student/courses/${course.documentId || course.id}`}
                  className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Continue Learning <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}