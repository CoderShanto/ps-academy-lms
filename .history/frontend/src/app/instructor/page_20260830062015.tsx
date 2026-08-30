'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PlusCircle, BookOpen, Video, Trash2, Edit3, X, HelpCircle, Layers } from 'lucide-react';
import { isAxiosError } from 'axios';

interface LessonItem {
  id: number;
  documentId?: string;
  title: string;
  videoUrl?: string;
  content?: string;
  order?: number;
}

interface CourseItem {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  lessons?: LessonItem[];
}

export default function CourseManagementStudio() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Course Form State ---
  const [editingCourseId, setEditingCourseId] = useState<string | number | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);

  // --- Lesson Form State ---
  const [selectedCourseId, setSelectedCourseId] = useState<string | number>('');
  const [editingLessonId, setEditingLessonId] = useState<string | number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [savingLesson, setSavingLesson] = useState(false);

  // --- Quiz Builder State ---
  const [attachQuiz, setAttachQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');

  const roleName = (user?.role?.name || user?.role?.type || '').toLowerCase();
  const hasAccess =
    roleName.includes('admin') ||
    roleName.includes('instructor') ||
    roleName.includes('content') ||
    roleName.includes('manager');

  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/courses?populate[lessons]=*');
      const list: CourseItem[] = data.data || [];
      setCourses(list);
      if (list.length > 0 && !selectedCourseId) {
        setSelectedCourseId(list[0].documentId || list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!hasAccess) {
        router.push('/student');
      } else {
        fetchCourses();
      }
    }
  }, [user, authLoading, hasAccess, router, fetchCourses]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // --- COURSE ACTIONS ---
  const handleStartEditCourse = (course: CourseItem) => {
    setEditingCourseId(course.documentId || course.id);
    setCourseTitle(course.title);
    setCourseDesc(course.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditCourse = () => {
    setEditingCourseId(null);
    setCourseTitle('');
    setCourseDesc('');
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    setSavingCourse(true);
    try {
      if (editingCourseId) {
        // Update existing course
        await api.put(`/courses/${editingCourseId}`, {
          data: {
            title: courseTitle.trim(),
            description: courseDesc.trim(),
          },
        });
        alert('Course updated successfully!');
      } else {
        // Create new course
        const slug = `${generateSlug(courseTitle)}-${Date.now().toString().slice(-4)}`;
        await api.post('/courses', {
          data: {
            title: courseTitle.trim(),
            slug,
            description: courseDesc.trim(),
            publishedAt: new Date().toISOString(),
          },
        });
        alert('Course created successfully!');
      }
      handleCancelEditCourse();
      await fetchCourses();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.error?.message || 'Failed to save course');
      } else {
        alert('Failed to save course');
      }
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    if (!confirm('Are you sure you want to delete this course and all its lessons?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      if (editingCourseId === courseId) handleCancelEditCourse();
      await fetchCourses();
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('Failed to delete course');
    }
  };

  // --- LESSON ACTIONS ---
  const handleStartEditLesson = (lesson: LessonItem) => {
    setEditingLessonId(lesson.documentId || lesson.id);
    setLessonTitle(lesson.title);
    setVideoUrl(lesson.videoUrl || '');
    setLessonContent(lesson.content || '');
    setAttachQuiz(false); // Can't re-create quiz via lesson update
  };

  const handleCancelEditLesson = () => {
    setEditingLessonId(null);
    setLessonTitle('');
    setVideoUrl('');
    setLessonContent('');
    setAttachQuiz(false);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !selectedCourseId) return;

    setSavingLesson(true);
    try {
      if (editingLessonId) {
        // Update existing lesson
        await api.put(`/lessons/${editingLessonId}`, {
          data: {
            title: lessonTitle.trim(),
            videoUrl: videoUrl.trim(),
            content: lessonContent.trim(),
          },
        });
        alert('Lesson updated successfully!');
      } else {
        // Create new lesson
        const activeCourse = courses.find(
          (c) => String(c.id) === String(selectedCourseId) || c.documentId === String(selectedCourseId)
        );
        const nextOrder = (activeCourse?.lessons?.length || 0) + 1;

        const lessonRes = await api.post('/lessons', {
          data: {
            title: lessonTitle.trim(),
            videoUrl: videoUrl.trim(),
            content: lessonContent.trim(),
            order: nextOrder,
            course: selectedCourseId,
            publishedAt: new Date().toISOString(),
          },
        });

        const createdLessonId = lessonRes.data?.data?.documentId || lessonRes.data?.data?.id;

        // Optionally attach quiz
        if (attachQuiz && questionText.trim() && createdLessonId) {
          const qRes = await api.post('/questions', {
            data: {
              questionText: questionText.trim(),
              optionA: optA.trim(),
              optionB: optB.trim(),
              optionC: optC.trim(),
              optionD: optD.trim(),
              correctAnswer,
              publishedAt: new Date().toISOString(),
            },
          });

          const createdQuestionId = qRes.data?.data?.documentId || qRes.data?.data?.id;

          await api.post('/quizzes', {
            data: {
              title: quizTitle.trim() || `${lessonTitle} Quiz`,
              passingScore: 60,
              lesson: createdLessonId,
              questions: [createdQuestionId],
              publishedAt: new Date().toISOString(),
            },
          });
        }
        alert('Lesson added successfully!');
      }

      handleCancelEditLesson();
      await fetchCourses();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.error?.message || 'Failed to save lesson');
      } else {
        alert('Failed to save lesson');
      }
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string | number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      if (editingLessonId === lessonId) handleCancelEditLesson();
      await fetchCourses();
    } catch (err) {
      console.error('Failed to delete lesson:', err);
      alert('Failed to delete lesson');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentSelectedCourse = courses.find(
    (c) => String(c.id) === String(selectedCourseId) || c.documentId === String(selectedCourseId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Curriculum & Course Studio</h1>
        <p className="text-gray-600 mt-1">
          Create, edit, and delete courses, lessons, and auto-graded MCQ quizzes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Creator/Editor & Catalog */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                {editingCourseId ? (
                  <>
                    <Edit3 className="h-5 w-5 mr-2 text-amber-600" /> Edit Course
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-5 w-5 mr-2 text-indigo-600" /> Create New Course
                  </>
                )}
              </h2>
              {editingCourseId && (
                <button
                  type="button"
                  onClick={handleCancelEditCourse}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Master Next.js App Router"
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Overview of this curriculum..."
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={savingCourse}
                className={`w-full py-2.5 text-white font-semibold rounded-lg transition disabled:opacity-50 text-sm shadow-sm ${
                  editingCourseId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {savingCourse ? 'Saving...' : editingCourseId ? 'Update Course' : 'Create Course'}
              </button>
            </form>
          </div>

          {/* Courses Catalog with Edit & Delete */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600" /> Courses Catalog ({courses.length})
            </h2>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {courses.map((c) => {
                const cId = c.documentId || c.id;
                const isSelected = String(selectedCourseId) === String(cId) || String(selectedCourseId) === String(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourseId(cId)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-gray-900 text-sm truncate">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.lessons?.length || 0} Lessons</p>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStartEditCourse(c)}
                        className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg transition"
                        title="Edit Course"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(cId)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                        title="Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Lesson/Quiz Editor & Curriculum Lessons List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add / Edit Lesson Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Video className="h-6 w-6 mr-2 text-indigo-600" />
                {editingLessonId ? 'Edit Lesson' : 'Add Lesson & Quiz to Course'}
              </h2>
              {editingLessonId && (
                <button
                  type="button"
                  onClick={handleCancelEditLesson}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Course</label>
                <select
                  value={selectedCourseId}
                  disabled={Boolean(editingLessonId)}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.documentId || c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g. 02. State Management & Hooks"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Video URL (YouTube/MP4)</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Lesson Notes / Content</label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Overview and key takeaways for this lesson..."
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Quiz Builder (only on create) */}
              {!editingLessonId && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attachQuiz}
                      onChange={(e) => setAttachQuiz(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300"
                    />
                    <span className="text-sm font-bold text-gray-900 flex items-center">
                      <HelpCircle className="h-4 w-4 mr-1 text-indigo-600" /> Attach Auto-Graded MCQ Quiz to this Lesson
                    </span>
                  </label>

                  {attachQuiz && (
                    <div className="mt-4 p-5 bg-indigo-50 rounded-xl border border-indigo-100 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-indigo-900 uppercase mb-1">Quiz Title</label>
                        <input
                          type="text"
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                          placeholder="e.g. State Management Quiz"
                          className="w-full px-3 py-2 bg-white text-gray-900 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-indigo-900 uppercase mb-1">Question 1</label>
                        <input
                          type="text"
                          required={attachQuiz}
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          placeholder="e.g. Which hook is used for side effects in React?"
                          className="w-full px-3 py-2 bg-white text-gray-900 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-indigo-800 mb-1">Option A</label>
                          <input
                            type="text"
                            required={attachQuiz}
                            value={optA}
                            onChange={(e) => setOptA(e.target.value)}
                            placeholder="useEffect"
                            className="w-full px-3 py-1.5 bg-white text-gray-900 border border-indigo-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-indigo-800 mb-1">Option B</label>
                          <input
                            type="text"
                            required={attachQuiz}
                            value={optB}
                            onChange={(e) => setOptB(e.target.value)}
                            placeholder="useState"
                            className="w-full px-3 py-1.5 bg-white text-gray-900 border border-indigo-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-indigo-800 mb-1">Option C</label>
                          <input
                            type="text"
                            required={attachQuiz}
                            value={optC}
                            onChange={(e) => setOptC(e.target.value)}
                            placeholder="useContext"
                            className="w-full px-3 py-1.5 bg-white text-gray-900 border border-indigo-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-indigo-800 mb-1">Option D</label>
                          <input
                            type="text"
                            required={attachQuiz}
                            value={optD}
                            onChange={(e) => setOptD(e.target.value)}
                            placeholder="useReducer"
                            className="w-full px-3 py-1.5 bg-white text-gray-900 border border-indigo-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-indigo-900 uppercase mb-1">Correct Answer</label>
                        <select
                          value={correctAnswer}
                          onChange={(e) => setCorrectAnswer(e.target.value)}
                          className="w-full px-3 py-2 bg-white text-gray-900 border border-indigo-200 rounded-lg text-sm font-bold focus:outline-none"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={savingLesson}
                className={`w-full py-3 text-white font-semibold rounded-lg transition disabled:opacity-50 text-base shadow-sm ${
                  editingLessonId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {savingLesson ? 'Saving...' : editingLessonId ? 'Update Lesson' : 'Add Lesson to Course'}
              </button>
            </form>
          </div>

          {/* Lessons List for Selected Course with Edit & Delete */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-indigo-600" />
              Lessons in &quot;{currentSelectedCourse?.title || 'Selected Course'}&quot; ({currentSelectedCourse?.lessons?.length || 0})
            </h3>

            {(!currentSelectedCourse?.lessons || currentSelectedCourse.lessons.length === 0) ? (
              <p className="text-sm text-gray-500 py-4">No lessons in this course yet. Use the form above to add the first lesson.</p>
            ) : (
              <div className="space-y-2.5">
                {currentSelectedCourse.lessons.map((lesson, idx) => {
                  const lId = lesson.documentId || lesson.id;
                  const isBeingEdited = editingLessonId === lId;

                  return (
                    <div
                      key={lesson.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        isBeingEdited ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="truncate pr-3">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {idx + 1}. {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{lesson.videoUrl || 'No video URL attached'}</p>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => handleStartEditLesson(lesson)}
                          className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                          title="Edit Lesson"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lId)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete Lesson"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}