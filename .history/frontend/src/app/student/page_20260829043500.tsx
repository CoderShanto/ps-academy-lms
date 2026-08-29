'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchMyCourses = async () => {
      try {
        const { data } = await api.get('/my-courses');
        const courses: EnrolledCourse[] = data.data || [];
        setEnrolledCourses(courses);

        const progressObj: Record<number, number> = {};
        for (const c of courses) {
          try {
            const { data: progRes } = await api.get(`/progress/course/${c.id}`);
            progressObj[c.id] = progRes.percentage || 0;
          } catch {
            progressObj[c.id] = 0;
          }
        }
        setProgressMap(progressObj);
      } catch (err) {
        console.error('Failed to load enrolled courses', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyCourses();
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.username}! Track your learning progress below.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Enrolled Courses</h2>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">You are not enrolled in any courses yet.</p>
            <Link
              href="/courses"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const percentage = progressMap[course.id] || 0;
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md transition"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}