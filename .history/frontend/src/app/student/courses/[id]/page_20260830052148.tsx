'use client';

import { useEffect, useState, use, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  ArrowLeft,
  Award,
  HelpCircle
} from 'lucide-react';

interface QuizItem {
  id: number;
  documentId?: string;
  title?: string;
}

interface Lesson {
  id: number;
  documentId?: string;
  title: string;
  videoUrl?: string;
  content?: string;
  order?: number;
  quiz?: QuizItem | QuizItem[];
}

interface Course {
  id: number;
  documentId?: string;
  title: string;
  lessons: Lesson[];
}

export default function StudentCoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<(number | string)[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Record<string | number, QuizItem>>({});
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // 1. Fetch live user progress for this course
  const fetchProgress = useCallback(async () => {
    try {
      const { data } = await api.get(`/progress/course/${courseId}`);
      if (data) {
        setCompletedLessonIds(data.completedLessonIds || []);
        setProgressPercentage(data.progressPercentage || 0);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [courseId]);

  // 2. Fetch all quizzes in LMS to map them to lessons
  const fetchQuizzes = useCallback(async () => {
    try {
      const { data } = await api.get('/quizzes?populate=*');
      const quizList = data.data || [];
      const map: Record<string | number, QuizItem> = {};

      quizList.forEach((q: any) => {
        if (q.lesson) {
          const lId = q.lesson.id;
          const lDocId = q.lesson.documentId;
          if (lId) map[lId] = { id: q.id, documentId: q.documentId, title: q.title };
          if (lDocId) map[lDocId] = { id: q.id, documentId: q.documentId, title: q.title };
        }
      });

      setAvailableQuizzes(map);
    } catch (err) {
      console.warn('Could not fetch quiz relations:', err);
    }
  }, []);

  // 3. Load Course details
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadCourse() {
      try {
        const { data } = await api.get(`/courses/${courseId}?populate=*`);
        const courseData: Course = data.data;
        setCourse(courseData);

        if (courseData?.lessons && courseData.lessons.length > 0) {
          setActiveLesson(courseData.lessons[0]);
        }

        await Promise.all([fetchProgress(), fetchQuizzes()]);
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadCourse();
    }
  }, [courseId, user, authLoading, router, fetchProgress, fetchQuizzes]);

  // Handle Mark Complete toggle
  const handleToggleComplete = async (lesson: Lesson) => {
    if (toggling) return;
    setToggling(true);

    const lessonIdentifier = lesson.id || lesson.documentId;
    const isCurrentlyCompleted =
      completedLessonIds.includes(lesson.id) ||
      (lesson.documentId ? completedLessonIds.includes(lesson.documentId) : false);

    // Optimistic UI update
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
        lessonId: lesson.id || lesson.documentId,
      });
      await fetchProgress();
    } catch (err) {
      console.error('Failed to toggle completion on server:', err);
      // Rollback on error
      await fetchProgress();
    } finally {
      setToggling(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <Link href="/student" className="mt-4 inline-flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const isLessonCompleted = (lesson: Lesson) => {
    return (
      completedLessonIds.includes(lesson.id) ||
      (lesson.documentId ? completedLessonIds.includes(lesson.documentId) : false)
    );
  };

  // Find linked quiz for the active lesson
  const currentLessonKey = activeLesson?.id || activeLesson?.documentId || '';
  const linkedQuiz = activeLesson ? availableQuizzes[currentLessonKey] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-800 gap-4 mb-8">
        <div>
          <Link href="/student" className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{course.title}</h1>
        </div>

        {/* Dynamic Progress Metric Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 min-w-[220px]">
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
            <span>Course Progress</span>
            <span className="text-indigo-600 font-extrabold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Player & Lesson Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 gap-4">
              <h2 className="text-xl font-bold text-gray-900">{activeLesson?.title || 'Select a Lesson'}</h2>

              {activeLesson && (
                <button
                  onClick={() => handleToggleComplete(activeLesson)}
                  disabled={toggling}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                    isLessonCompleted(activeLesson)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isLessonCompleted(activeLesson) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" /> Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-1.5 text-gray-400" /> Mark Complete
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black mb-6">
              {activeLesson?.videoUrl && (activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be')) ? (
                <iframe
                  src={
                    activeLesson.videoUrl.includes('watch?v=')
                      ? activeLesson.videoUrl.replace('watch?v=', 'embed/')
                      : activeLesson.videoUrl.includes('youtu.be/')
                      ? activeLesson.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                      : activeLesson.videoUrl
                  }
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <PlayCircle className="h-14 w-14 mb-2 text-gray-500" />
                  <p className="text-sm font-medium">No video URL configured for this lesson</p>
                </div>
              )}
            </div>

            {/* Lesson Text Content */}
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed mb-6">
              <p>{activeLesson?.content || 'No description provided for this lesson.'}</p>
            </div>

            {/* Auto-Graded Quiz Banner */}
            {linkedQuiz && (
              <div className="mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{linkedQuiz.title || 'Lesson Quiz Available'}</h4>
                    <p className="text-xs text-gray-600">Test your comprehension with an auto-graded MCQ test.</p>
                  </div>
                </div>
                <Link
                  href={`/student/quizzes/${linkedQuiz.documentId || linkedQuiz.id}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                >
                  Take Quiz
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Lessons Playlist */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100">
              <PlayCircle className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900 text-base">Lessons Playlist</h3>
            </div>

            <div className="space-y-2">
              {course.lessons?.map((lesson, idx) => {
                const isActive = activeLesson?.id === lesson.id;
                const isCompleted = isLessonCompleted(lesson);
                const hasQuiz = Boolean(availableQuizzes[lesson.id] || (lesson.documentId && availableQuizzes[lesson.documentId]));

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition text-sm ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                        : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {idx + 1}. {lesson.title}
                      </span>
                    </div>

                    {hasQuiz && (
                      <HelpCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 ml-2" title="Quiz Available" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}