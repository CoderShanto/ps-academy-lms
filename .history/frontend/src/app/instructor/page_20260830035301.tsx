'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PlusCircle, BookOpen, Layers, Trash2, Edit3 } from 'lucide-react';
import { isAxiosError } from 'axios';

interface Lesson {
  id: number;
  documentId?: string;
  title: string;
  order: number;
  videoUrl?: string;
}

interface Course {
  id: number;
  documentId?: string;
  title: string;
  description: string;
  lessons?: Lesson[];
}

export default function InstructorStudioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Course Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courseError, setCourseError] = useState('');

  // Lesson Form Modal / Target State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonOrder, setLessonOrder] = useState<number | string>(1);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [lessonError, setLessonError] = useState('');

  const fetchInstructorCourses = useCallback(async () => {
    try {
      // Fetch all courses populated with lessons
      const { data } = await api.get('/courses?populate=*');
      setCourses(data.data || []);
    } catch (err: unknown) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role?.name !== 'Instructor' && user.role?.name !== 'Admin' && user.role?.name !== 'Content Manager') {
        router.push('/student');
      } else {
        fetchInstructorCourses();
      }
    }
  }, [user, authLoading, router, fetchInstructorCourses]);

 const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreatingCourse(true);
    setCourseError('');

    try {
      // Auto-generate URL-friendly slug from title
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || `course-${Date.now()}`;

      const payload: Record<string, any> = {
        title,
        description,
        slug: generatedSlug,
      };

      if (user?.id) {
        payload.instructor = user.id;
      }

      await api.post('/courses', { data: payload });

      setTitle('');
      setDescription('');
      fetchInstructorCourses();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        // Fallback without instructor field if relation is strict
        try {
          const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await api.post('/courses', {
            data: { title, description, slug: generatedSlug },
          });
          setTitle('');
          setDescription('');
          fetchInstructorCourses();
          return;
        } catch (retryErr: unknown) {
          if (isAxiosError(retryErr)) {
            setCourseError(retryErr.response?.data?.error?.message || 'Failed to create course');
          }
        }
      } else {
        setCourseError('Failed to create course');
      }
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !lessonTitle.trim()) return;

    setCreatingLesson(true);
    setLessonError('');

    try {
      const parsedOrder = parseInt(String(lessonOrder), 10);
      const safeOrder = isNaN(parsedOrder) ? 1 : parsedOrder;
      const courseTarget = selectedCourse.documentId || selectedCourse.id;

      await api.post('/lessons', {
        data: {
          title: lessonTitle,
          content: lessonContent,
          videoUrl: lessonVideoUrl,
          order: safeOrder,
          course: courseTarget,
        },
      });

      setLessonTitle('');
      setLessonContent('');
      setLessonVideoUrl('');
      setLessonOrder(1);
      setSelectedCourse(null);
      fetchInstructorCourses();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setLessonError(err.response?.data?.error?.message || 'Failed to create lesson');
      } else {
        setLessonError('Failed to create lesson');
      }
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleDeleteCourse = async (courseId: number | string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      fetchInstructorCourses();
    } catch (err: unknown) {
      console.error('Delete error:', err);
      alert('Failed to delete course');
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Studio</h1>
          <p className="text-gray-600 mt-1">Create courses, manage lessons, and track curriculum</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Course Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2 text-indigo-600" />
            Create New Course
          </h2>

          {courseError && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">{courseError}</div>}

          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master TypeScript and Next.js"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the course content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={creatingCourse}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 text-sm shadow-sm"
            >
              {creatingCourse ? 'Creating...' : 'Publish Course'}
            </button>
          </form>
        </div>

        {/* Existing Courses & Lessons List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
            Your Courses ({courses.length})
          </h2>

          {courses.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
              No courses created yet. Use the form on the left to add your first course.
            </div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{c.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{c.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedCourse(c)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center transition"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Add Lesson
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.documentId || c.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons inside course */}
                <div className="p-6 bg-gray-50">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                    <Layers className="h-4 w-4 mr-1 text-gray-400" />
                    Curriculum Lessons ({c.lessons?.length || 0})
                  </h4>

                  {c.lessons && c.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {c.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-400">#{lesson.order || idx + 1}</span>
                            <span className="font-medium text-gray-800">{lesson.title}</span>
                          </div>
                          {lesson.videoUrl && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                              Video Attached
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No lessons added to this course yet.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Lesson Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Lesson</h3>
            <p className="text-sm text-gray-500 mb-4">Adding to: {selectedCourse.title}</p>

            {lessonError && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">{lessonError}</div>}

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. 03. State Management & Hooks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order #</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Text / Code Content</label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Lesson notes, code examples, markdown..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingLesson}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-sm"
                >
                  {creatingLesson ? 'Saving...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}