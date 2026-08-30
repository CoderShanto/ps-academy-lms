'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, PlayCircle, Lock, ShieldAlert, Settings } from 'lucide-react';
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
  instructor?: {
    id: number;
    username: string;
  };
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

  // Role detection
  const roleName = (user?.role?.name || user?.role?.type || '').toLowerCase();
  const isAdmin = roleName.includes('admin');
  const isContentManager = roleName.includes('manager') || roleName.includes('content');
  const isInstructor = roleName.includes('instructor');
  const isStudent = !isAdmin && !isContentManager && !isInstructor;
  const isStaffRole = Boolean(user && !isStudent);

  // Ownership check
  const isCourseOwner = course?.instructor?.id === user?.id;
  const canEditInStudio = isAdmin || isContentManager || (isInstructor && isCourseOwner);

  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await api.get(`/courses/${courseId}?populate=*`);
        setCourse(data.data || null);

        if (user && isStudent) {
          try {
            const enrollRes = await api.get('/my-courses');
            const myCourses = enrollRes.data || [];
            const found = myCourses.some(
              (c: any) => String(c.id) === String(courseId) || c.documentId === String(courseId)
            );
            setIsEnrolled(found);
          } catch {
            // Not enrolled
          }
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId, user, isStudent]);

const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Course null guard check for TypeScript
    if (!course) {
      console.error('No course selected');
      return;
    }

    setEnrolling(true);
    try {
      const courseIdentifier = course.id || course.documentId;

      await api.post('/enrollments', {
        data: {
          course: courseIdentifier,
          student: user.id,
        },
      });

      setIsEnrolled(true);
      const targetPath = course.documentId || course.id;
      router.push(`/student/courses/${targetPath}`);
    } catch (err) {
      console.error('Enrollment error:', err);
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

        {/* Right Sidebar - Role-Based Action Box */}
        <div>
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Access & Enrollment</h3>
            <p className="text-sm text-gray-600 mb-6">Course curriculum, lessons, and auto-graded assessments.</p>

            {/* Case 1: Staff Roles (Admin, Content Manager, Instructor) */}
            {isStaffRole ? (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                  <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold block uppercase mb-0.5">{roleName} Account</span>
                    {canEditInStudio
                      ? 'Staff accounts do not enroll as students. Manage or edit this curriculum in the studio.'
                      : 'This course is owned and managed by another instructor.'}
                  </div>
                </div>

                {canEditInStudio ? (
                  <Link
                    href={`/instructor?courseId=${courseKey}`}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition flex items-center justify-center text-sm shadow-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" /> Open Course in Studio
                  </Link>
                ) : (
                  <Link
                    href="/instructor"
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition flex items-center justify-center text-sm shadow-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" /> Open My Studio
                  </Link>
                )}
              </div>
            ) : isEnrolled ? (
              /* Case 2: Enrolled Student */
              <Link
                href={`/student/courses/${courseKey}`}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition flex items-center justify-center text-sm shadow-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Continue Course
              </Link>
            ) : (
              /* Case 3: Public / Unenrolled Student */
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm shadow-sm disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : user ? 'Enroll Now (Student)' : 'Log in to Enroll'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}