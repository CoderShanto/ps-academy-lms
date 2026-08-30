'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, ArrowLeft, PlayCircle, Lock } from 'lucide-react';
import { isAxiosError } from 'axios';

interface Lesson {
  id: number;
  documentId?: string;
  title: string;
}

interface Course {
  id: number;
  documentId?: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export default function PublicCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await api.get(`/courses/${courseId}?populate=*`);
        setCourse(data.data || null);

        if (user) {
          try {
            const enrollRes = await api.get('/my-courses');
            const myCourses = enrollRes.data || [];
            const found = myCourses.some(
              (c: any) => String(c.id) === String(courseId) || c.documentId === String(courseId)
            );
            setIsEnrolled(found);
          } catch {
            // Not enrolled or not student
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/enrollments', {
        data: {
          course: course?.id || course?.documentId,
        },
      });
      setIsEnrolled(true);
      router.push(`/student/courses/${course?.documentId || course?.id}`);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.error?.message || 'Enrollment failed');
      } else {
        alert('Enrollment failed');
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <Link href="/courses" className="mt-4 inline-flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to courses
        </Link>
      </div>
    );
  }

  const courseKey = course.documentId || course.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/courses" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-gray-700 text-base leading-relaxed mb-6">{course.description || 'No description provided.'}</p>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Curriculum Syllabus ({course.lessons?.length || 0} Lessons)</h3>
            <div className="space-y-2.5">
              {course.lessons?.map((l, idx) => (
                <div key={l.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <PlayCircle className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">
                      {idx + 1}. {l.title}
                    </span>
                  </div>
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enrollment Status</h3>
            <p className="text-sm text-gray-600 mb-6">Get lifetime access to this course, lessons, and interactive quizzes.</p>

            {isEnrolled ? (
              <Link
                href={`/student/courses/${courseKey}`}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center justify-center text-sm shadow-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Continue Course
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm shadow-sm disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now (Free)'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}