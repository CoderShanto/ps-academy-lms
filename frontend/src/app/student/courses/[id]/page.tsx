'use client';

import { useEffect, useState, useCallback, use } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Award,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface Question {
  id: number;
  documentId?: string;
  questionText: string;
}

interface QuizItem {
  id: number;
  documentId?: string;
  title: string;
  passingScore?: number;
  questions?: Question[];
  lesson?: {
    id?: number;
    documentId?: string;
  };
}

interface Lesson {
  id: number;
  documentId?: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}

interface Course {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export default function StudentCoursePlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<(number | string)[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [availableQuizzes, setAvailableQuizzes] = useState<Record<string | number, QuizItem>>({});
  const [loading, setLoading] = useState(true);

  // Fetch quizzes and map them by lesson ID
  const fetchQuizzes = useCallback(async () => {
    try {
      const { data } = await api.get('/quizzes?populate=*');
      const quizList: QuizItem[] = data.data || [];
      const map: Record<string | number, QuizItem> = {};

      quizList.forEach((q) => {
        if (q.lesson) {
          const lId = q.lesson.id;
          const lDocId = q.lesson.documentId;
          if (lId !== undefined) {
            map[lId] = { id: q.id, documentId: q.documentId, title: q.title };
          }
          if (lDocId) {
            map[lDocId] = { id: q.id, documentId: q.documentId, title: q.title };
          }
        }
      });

      setAvailableQuizzes(map);
    } catch (err) {
      console.warn('Could not fetch quiz relations:', err);
    }
  }, []);

  // Fetch course details & current student progress
  const fetchCourseData = useCallback(async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}?populate=*`);
      const courseData: Course = data.data;
      setCourse(courseData);

      if (courseData?.lessons?.length > 0) {
        setActiveLesson(courseData.lessons[0]);
      }

      // Fetch student progress for this course
      try {
        const progressRes = await api.get(`/progress/course/${courseId}`);
        const pData = progressRes.data;
        setCompletedLessonIds(pData.completedLessonIds || []);
        setProgressPercentage(pData.progressPercentage || 0);
      } catch (pErr) {
        console.warn('Could not fetch course progress:', pErr);
      }
    } catch (err) {
      console.error('Failed to load course player:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      fetchCourseData();
      fetchQuizzes();
    }
  }, [user, authLoading, router, fetchCourseData, fetchQuizzes]);

  // Toggle lesson complete status
  const handleToggleComplete = async (lesson: Lesson) => {
    const lessonIdentifier = lesson.documentId || lesson.id;
    if (!lessonIdentifier) return;

    const isCurrentlyCompleted =
      completedLessonIds.includes(lesson.id) ||
      (lesson.documentId ? completedLessonIds.includes(lesson.documentId) : false);

    let nextCompleted: (number | string)[];
    if (isCurrentlyCompleted) {
      nextCompleted = completedLessonIds.filter(
        (id) => id !== lesson.id && id !== lesson.documentId
      );
    } else {
      nextCompleted = [...completedLessonIds, lessonIdentifier];
    }

    setCompletedLessonIds(nextCompleted);

    const total = course?.lessons?.length || 1;
    setProgressPercentage(Math.round((nextCompleted.length / total) * 100));

    try {
      await api.post('/progress/toggle', {
        lessonId: lesson.documentId || lesson.id,
      });
    } catch (err) {
      console.error('Failed to sync progress:', err);
      // Revert optimistic update on failure
      fetchCourseData();
    }
  };

  if (authLoading || loading) {
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
        <Link href="/student" className="mt-4 inline-flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const activeLessonQuiz = activeLesson
    ? availableQuizzes[activeLesson.documentId || activeLesson.id]
    : undefined;

  const isActiveLessonCompleted = activeLesson
    ? completedLessonIds.includes(activeLesson.id) ||
      (activeLesson.documentId ? completedLessonIds.includes(activeLesson.documentId) : false)
    : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Progress */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
        <div>
          <Link
            href="/student"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to My Courses
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        </div>

        {/* Progress Badge & Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm min-w-[260px]">
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
            <span>Overall Progress</span>
            <span className="text-indigo-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Learning Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Video Player / Lesson Notes */}
        <div className="lg:col-span-2 space-y-6">
          {activeLesson ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {activeLesson.title}
                </h2>
                <button
                  onClick={() => handleToggleComplete(activeLesson)}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold transition border ${
                    isActiveLessonCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {isActiveLessonCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" /> Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-1.5 text-gray-400" /> Mark Complete
                    </>
                  )}
                </button>
              </div>

              {/* Video Embed or Placeholder */}
              {activeLesson.videoUrl ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                  {activeLesson.videoUrl.includes('youtube.com') ||
                  activeLesson.videoUrl.includes('youtu.be') ? (
                    <iframe
                      className="w-full h-full"
                      src={
                        activeLesson.videoUrl.includes('watch?v=')
                          ? activeLesson.videoUrl.replace('watch?v=', 'embed/')
                          : activeLesson.videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                      }
                      title={activeLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      controls
                      className="w-full h-full"
                      src={activeLesson.videoUrl}
                    ></video>
                  )}
                </div>
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                  <PlayCircle className="h-12 w-12 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-medium">No video attached to this lesson.</p>
                </div>
              )}

              {/* Lesson Notes */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center mb-3">
                  <FileText className="h-4 w-4 mr-1.5 text-indigo-600" /> Lesson Content & Notes
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-5 rounded-2xl border border-gray-100 whitespace-pre-wrap leading-relaxed">
                  {activeLesson.content || 'No text notes provided for this lesson.'}
                </div>
              </div>

              {/* Attached Quiz Action */}
              {activeLessonQuiz && (
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-indigo-950 text-sm">{activeLessonQuiz.title}</p>
                      <p className="text-xs text-indigo-700">Auto-graded assessment for this lesson</p>
                    </div>
                  </div>
                  <Link
                    href={`/student/quizzes/${activeLessonQuiz.documentId || activeLessonQuiz.id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition inline-flex items-center"
                  >
                    <Award className="h-3.5 w-3.5 mr-1" /> Take Quiz
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
              <p className="text-gray-500">No lessons available in this course.</p>
            </div>
          )}
        </div>

        {/* Right 1 Column: Lesson Syllabus Playlist */}
        <div>
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm sticky top-6">
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center justify-between">
              <span>Course Syllabus</span>
              <span className="text-xs font-semibold text-gray-500">
                {course.lessons?.length || 0} Lessons
              </span>
            </h3>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {course.lessons?.map((l, idx) => {
                const isActive = (l.documentId || l.id) === (activeLesson?.documentId || activeLesson?.id);
                const isCompleted =
                  completedLessonIds.includes(l.id) ||
                  (l.documentId ? completedLessonIds.includes(l.documentId) : false);

                return (
                  <div
                    key={l.id}
                    onClick={() => setActiveLesson(l)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate pr-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(l);
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-indigo-600 transition"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300 hover:text-gray-500" />
                        )}
                      </button>
                      <div className="truncate">
                        <p
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-indigo-900' : 'text-gray-900'
                          }`}
                        >
                          {idx + 1}. {l.title}
                        </p>
                      </div>
                    </div>

                    {availableQuizzes[l.documentId || l.id] && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md flex-shrink-0">
                        QUIZ
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}