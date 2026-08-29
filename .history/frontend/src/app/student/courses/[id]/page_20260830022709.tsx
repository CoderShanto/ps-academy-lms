'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Circle, PlayCircle, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Quiz {
  id: number;
  documentId?: string;
  title: string;
}

interface Lesson {
  id: number;
  documentId?: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order?: number;
  quiz?: Quiz;
  quizzes?: Quiz[];
}

interface CourseData {
  id: number;
  documentId?: string;
  title: string;
  lessons?: Lesson[];
  quizzes?: Quiz[];
}

function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return url;
  if (url.includes('watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return null;
}

export default function StudentCourseViewerPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<(number | string)[]>([]);
  const [percentage, setPercentage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [marking, setMarking] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        let fetchedCourse: CourseData | null = null;
        
        // Strapi v5 clean population format
        try {
          const { data } = await api.get(`/courses/${id}?populate=*`);
          fetchedCourse = data.data;
        } catch {
          const { data } = await api.get(`/courses?filters[id][$eq]=${id}&populate=*`);
          if (data.data && data.data.length > 0) {
            fetchedCourse = data.data[0];
          }
        }

        if (fetchedCourse) {
          setCourse(fetchedCourse);

          const sortedLessons = (fetchedCourse.lessons || []).slice().sort(
            (a: Lesson, b: Lesson) => (a.order || 0) - (b.order || 0)
          );

          if (sortedLessons.length > 0) {
            setSelectedLesson(sortedLessons[0]);
          }

          try {
            const courseTarget = fetchedCourse.documentId || fetchedCourse.id;
            const { data: progRes } = await api.get(`/progress/course/${courseTarget}`);
            setCompletedLessonIds(progRes.completedLessonIds || []);
            setPercentage(progRes.percentage || 0);
          } catch (progErr) {
            console.warn('Progress lookup warning:', progErr);
          }
        }
      } catch (err) {
        console.error('Failed to load course details', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchData();
    }
  }, [id, user, authLoading, router]);
  const handleMarkComplete = async () => {
    if (!selectedLesson || !course) return;

    setMarking(true);
    try {
      const lessonTarget = selectedLesson.id || selectedLesson.documentId;
      const courseTarget = course.id || course.documentId;

      const { data } = await api.post('/progress/mark-complete', {
        lessonId: lessonTarget,
        courseId: courseTarget,
      });

      const currentId = selectedLesson.id;
      const updatedIds = Array.from(
        new Set([...completedLessonIds, currentId, selectedLesson.documentId].filter(Boolean))
      );
      setCompletedLessonIds(updatedIds as (string | number)[]);

      const newPercentage =
        data.meta?.percentage ??
        Math.min(100, Math.round((updatedIds.length / (course.lessons?.length || 1)) * 100));
      setPercentage(newPercentage);
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
      const currentId = selectedLesson.id;
      setCompletedLessonIds((prev) => [...prev, currentId]);
      setPercentage((prev) => Math.min(100, prev + 50));
    } finally {
      setMarking(false);
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
    return <div className="text-center py-20 text-gray-600">Course content not found.</div>;
  }

  const lessons = (course.lessons || []).slice().sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const isCurrentCompleted = selectedLesson
    ? completedLessonIds.includes(selectedLesson.id) || (selectedLesson.documentId ? completedLessonIds.includes(selectedLesson.documentId) : false)
    : false;

  const embedUrl = selectedLesson ? getEmbedUrl(selectedLesson.videoUrl) : null;

  // Extract quizzes from course or from individual lessons
  const lessonQuizzes: Quiz[] = [];
  if (course.quizzes && course.quizzes.length > 0) {
    lessonQuizzes.push(...course.quizzes);
  }
  lessons.forEach((l) => {
    if (l.quiz) lessonQuizzes.push(l.quiz);
    if (l.quizzes && l.quizzes.length > 0) lessonQuizzes.push(...l.quizzes);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Link href="/student" className="inline-flex items-center text-sm text-indigo-600 hover:underline mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        </div>

        {/* Real-time Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm min-w-[260px]">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
            <span>Course Progress</span>
            <span className="text-indigo-600 font-bold">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {selectedLesson ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
                <button
                  onClick={handleMarkComplete}
                  disabled={marking || isCurrentCompleted}
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm ${
                    isCurrentCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isCurrentCompleted ? 'Completed' : marking ? 'Saving...' : 'Mark as Complete'}</span>
                </button>
              </div>

              {embedUrl ? (
                <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
                  <iframe
                    src={embedUrl}
                    title={selectedLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                </div>
              ) : null}

              <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {selectedLesson.content || 'No text content available for this lesson.'}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 text-gray-500">
              No lesson selected.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <PlayCircle className="h-5 w-5 mr-2 text-indigo-600" />
              Lessons Playlist
            </h3>

            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isSelected = selectedLesson?.id === lesson.id;
                const isCompleted =
                  completedLessonIds.includes(lesson.id) ||
                  (lesson.documentId ? completedLessonIds.includes(lesson.documentId) : false);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm truncate ${isSelected ? 'font-bold text-indigo-900' : 'text-gray-700'}`}>
                        {idx + 1}. {lesson.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quizzes Sidebar */}
            {lessonQuizzes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Assessment Quiz</h4>
                {lessonQuizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/student/quizzes/${quiz.documentId || quiz.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition text-amber-900"
                  >
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-semibold">{quiz.title}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}