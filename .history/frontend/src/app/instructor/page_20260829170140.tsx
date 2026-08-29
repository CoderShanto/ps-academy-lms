'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Video, Trash2, Users } from 'lucide-react';
import { isAxiosError } from 'axios';

interface Lesson {
  id: number;
  title: string;
  order?: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  lessons?: Lesson[];
}

export default function InstructorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Course Form State
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseDescription, setCourseDescription] = useState<string>('');
  const [creatingCourse, setCreatingCourse] = useState<boolean>(false);

  // New Lesson Form State
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [lessonContent, setLessonContent] = useState<string>('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState<string>('');
  const [creatingLesson, setCreatingLesson] = useState<boolean>(false);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses?populate=*');
      // Instructors see platform courses or filtered by user
      setCourses(data.data || []);
    } catch (err) {
      console.error('Failed to fetch instructor courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role?.name !== 'Instructor' && user.role?.name !== 'Admin')) {
        router.push('/login');
        return;
      }
      fetchCourses();
    }
  }, [user, authLoading, router]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle) return;

    setCreatingCourse(true);
    try {
      await api.post('/courses', {
        data: {
          title: courseTitle,
          description: courseDescription,
          instructor: user?.id,
        },
      });
      setCourseTitle('');
      setCourseDescription('');
      setShowCourseModal(false);
      fetchCourses();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.error?.message || 'Failed to create course');
      }
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourseId || !lessonTitle) return;

    setCreatingLesson(true);
    try {
      await api.post('/lessons', {
        data: {
          title: lessonTitle,
          content: lessonContent,
          videoUrl: lessonVideoUrl,
          course: activeCourseId,
        },
      });
      setLessonTitle('');
      setLessonContent('');
      setLessonVideoUrl('');
      setActiveCourseId(null);
      fetchCourses();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.error?.message || 'Failed to add lesson');
      }
    } finally {
      setCreatingLesson(false);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Studio</h1>
          <p className="text-gray-600 mt-1">Manage your courses, lessons, and content curriculum</p>
        </div>

        <button
          onClick={() => setShowCourseModal(true)}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {courses.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No courses available. Create your first course above!</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                </div>

                <button
                  onClick={() => setActiveCourseId(activeCourseId === course.id ? null : course.id)}
                  className="inline-flex items-center space-x-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3 py-2 rounded-lg transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Lesson</span>
                </button>
              </div>

              {/* Add Lesson inline dropdown */}
              {activeCourseId === course.id && (
                <form onSubmit={handleAddLesson} className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                  <h3 className="font-semibold text-sm text-indigo-900">Add New Lesson to "{course.title}"</h3>
                  <input
                    type="text"
                    required
                    placeholder="Lesson Title"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Video URL (e.g. YouTube embed link)"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-indigo-500"
                  />
                  <textarea
                    rows={3}
                    placeholder="Lesson Content / Notes..."
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-indigo-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveCourseId(null)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingLesson}
                      className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition"
                    >
                      {creatingLesson ? 'Saving...' : 'Save Lesson'}
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Lessons */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Curriculum Lessons</h4>
                <div className="space-y-2">
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium text-gray-800">
                          {idx + 1}. {lesson.title}
                        </span>
                        <span className="text-xs text-gray-400">Lesson ID: #{lesson.id}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No lessons added to this course yet.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                >
                  {creatingCourse ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}