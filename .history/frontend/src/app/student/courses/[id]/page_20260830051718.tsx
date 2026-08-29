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

interface QuizRelation {
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
  quiz?: QuizRelation | QuizRelation[];
  quizzes?: QuizRelation[];
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
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

async function loadCourse() {
      try {
        let courseData: Course | null = null;
        
        // Safe population strategy that works universally across Strapi schemas
        try {
          const { data } = await api.get(`/courses/${courseId}?populate=*`);
          courseData = data.data;
        } catch {
          const { data } = await api.get(`/courses/${courseId}`);
          courseData = data.data;
        }

        setCourse(courseData);

        if (courseData?.lessons && courseData.lessons.length > 0) {
          setActiveLesson(courseData.lessons[0]);
        }

        await fetchProgress();
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadCourse();
    }
  }, [courseId, user, authLoading, router, fetchProgress]);

  const handleToggleComplete = async (lesson: Lesson) => {
    if (toggling) return;
    setToggling(true);

    try {
      await api.post('/progress/toggle', {
        lessonId: lesson.documentId || lesson.id,
      });
      await fetchProgress();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
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
    return completedLessonIds.includes(lesson.id) || (lesson.documentId && completedLessonIds.includes(lesson.documentId));
  };

  // Extract quiz ID for active lesson
  const activeQuiz =
    (Array.isArray(activeLesson?.quiz) ? activeLesson?.quiz[0] : activeLesson?.quiz) ||
    (Array.isArray(activeLesson?.quizzes) ? activeLesson?.quizzes[0] : activeLesson?.quizzes);

  const activeQuizId = activeQuiz?.documentId || activeQuiz?.id;

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

        {/* Progress Metric Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 min-w-[220px]">
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
            <span>Course Progress</span>
            <span className="text-indigo-600 font-extrabold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
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
              {activeLesson?.videoUrl ? (
                <iframe
                  src={
                    activeLesson.videoUrl.includes('watch?v=')
                      ? activeLesson.videoUrl.replace('watch?v=', 'embed/')
                      : activeLesson.videoUrl
                  }
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <PlayCircle className="h-16 w-16 mb-2 text-gray-600" />
                  <p className="text-sm">No video URL configured for this lesson</p>
                </div>
              )}
            </div>

            {/* Lesson Text Content */}
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed mb-6">
              <p>{activeLesson?.content || 'No description provided for this lesson.'}</p>
            </div>

            {/* Quiz Banner if linked */}
            {activeQuizId && (
              <div className="mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Lesson Quiz Available</h4>
                    <p className="text-xs text-gray-600">Test your comprehension with an auto-graded MCQ test.</p>
                  </div>
                </div>
                <Link
                  href={`/student/quizzes/${activeQuizId}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
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

                    {(lesson.quiz || lesson.quizzes) && (
                      <HelpCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 ml-2" title="Has Quiz" />
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