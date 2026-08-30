'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, PlayCircle, ArrowRight, Award } from 'lucide-react';

interface StudentProgressRecord {
  id: number;
  courseId: string | number;
  courseTitle: string;
  courseDescription: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  enrolledAt: string;
}

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [records, setRecords] = useState<StudentProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

const fetchMyProgress = async () => {
    try {
      const res = await api.get('/progress/my-progress');

      // ১. রেসপন্স থেকে অ্যারে বের করা
      const rawList: StudentProgressRecord[] = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.records || [];

      // ২. টাইটেল এবং আইডি দিয়ে ডুপ্লিকেট ফিল্টার করা
      const seen = new Set<string>();
      const uniqueRecords: StudentProgressRecord[] = [];

      rawList.forEach((item) => {
        // কোর্স টাইটেল অথবা কোর্স আইডি দিয়ে ইউনিক কি তৈরি
        const key = String(item.courseTitle || item.courseId || item.id).trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRecords.push(item);
        }
      });

      setRecords(uniqueRecords);
    } catch (err) {
      console.error('Failed to load my progress:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchMyProgress();
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const completedCoursesCount = records.filter((r) => r.progressPercentage === 100).length;
  const inProgressCoursesCount = records.filter((r) => r.progressPercentage < 100).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header with High-Contrast Text */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track your enrolled courses, lesson milestones, and completion status
          </p>
        </div>
        <Link
          href="/student/quizzes"
          className="inline-flex items-center px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Award className="h-4 w-4 mr-2 text-indigo-600" /> View Quiz Results
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Enrolled Courses</p>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{inProgressCoursesCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{completedCoursesCount}</p>
          </div>
        </div>
      </div>

      {/* Courses Progress Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Learning Progress</h2>
          <Link
            href="/courses"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-400 flex items-center"
          >
            Browse More Courses <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">You haven&apos;t enrolled in any courses yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">Explore the course catalog to start learning</p>
            <Link
              href="/courses"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((item) => {
              const isFinished = item.progressPercentage === 100;
              const uniqueKey = item.courseId || item.id;

              return (
                <div
                  key={uniqueKey}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isFinished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isFinished ? 'Completed' : 'In Progress'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.completedLessons} of {item.totalLessons} Lessons
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.courseTitle}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-6">
                      {item.courseDescription || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                        <span>Course Progress</span>
                        <span>{item.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            isFinished ? 'bg-emerald-600' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${item.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      href={`/student/courses/${item.courseId}`}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm flex items-center justify-center transition"
                    >
                      {isFinished ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1.5" /> Review Course
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-1.5" /> Continue Learning
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}