'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { isAxiosError } from 'axios';

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourseAndStatus = async () => {
      try {
        const { data } = await api.get(`/courses/${id}?populate=*`);
        setCourse(data.data);

        if (user) {
          const { data: myCoursesRes } = await api.get('/my-courses');
          const isUserEnrolled = (myCoursesRes.data || []).some(
            (c: any) => c.id === Number(id)
          );
          setEnrolled(isUserEnrolled);
        }
      } catch (err: unknown) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseAndStatus();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    setMessage('');

    try {
      await api.post('/enrollments', {
        data: {
          course: Number(id),
        },
      });
      setEnrolled(true);
      setMessage('Successfully enrolled in the course!');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setMessage(err.response?.data?.error?.message || 'Enrollment failed.');
      } else {
        setMessage('Enrollment failed.');
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
    return <div className="text-center py-20 text-gray-600">Course not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="mt-3 text-indigo-100 max-w-3xl">{course.description}</p>
          
          <div className="mt-6 flex items-center space-x-4">
            {enrolled ? (
              <button
                onClick={() => router.push(`/student/courses/${id}`)}
                className="bg-white text-indigo-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition shadow-sm"
              >
                Go to Lessons
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-white text-indigo-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 shadow-sm"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
          {message && <p className="mt-3 text-sm text-yellow-200">{message}</p>}
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
            Curriculum
          </h2>

          <div className="space-y-3">
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((lesson: any, idx: number) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-500 text-sm">#{idx + 1}</span>
                      <span className="font-medium text-gray-800">{lesson.title}</span>
                    </div>
                    {enrolled ? (
                      <PlayCircle className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-sm">No lessons uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}