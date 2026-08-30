'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HelpCircle, ArrowLeft, CheckCircle, XCircle, Calendar, Award } from 'lucide-react';

interface QuizAttempt {
  id: number;
  documentId?: string;
  score: number;
  passed: boolean;
  submittedAt: string;
  quizTitle: string;
  lessonTitle: string;
  courseTitle: string;
}

export default function StudentQuizResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchAttempts();
      }
    }
  }, [user, authLoading, router]);

  const fetchAttempts = async () => {
    try {
      const { data } = await api.get('/quiz-attempts/my-attempts');
      setAttempts(data.data || []);
    } catch (err) {
      console.error('Failed to load quiz results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalPassed = attempts.filter((a) => a.passed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          href="/student"
          className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">My Quiz Results & Assessment History</h1>
        <p className="text-gray-600 mt-1">Stored scores and pass/fail evaluations from completed lessons</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Total Quizzes Taken</p>
            <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Passed Assessments</p>
            <p className="text-2xl font-bold text-gray-900">{totalPassed}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Average Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {attempts.length > 0
                ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="font-bold text-gray-900 text-base">Recorded Attempts</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {attempts.length} Submissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase bg-white">
                <th className="py-4 px-6">Quiz / Lesson</th>
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6">Result</th>
                <th className="py-4 px-6">Date Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No quiz attempts recorded yet.
                  </td>
                </tr>
              ) : (
                attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{att.quizTitle}</p>
                      <p className="text-xs text-gray-500">{att.lessonTitle}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-medium">{att.courseTitle}</td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-gray-900 text-base">{att.score}%</span>
                    </td>
                    <td className="py-4 px-6">
                      {att.passed ? (
                        <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> PASSED
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <XCircle className="h-3.5 w-3.5 mr-1" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs flex items-center space-x-1 mt-3">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(att.submittedAt).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}