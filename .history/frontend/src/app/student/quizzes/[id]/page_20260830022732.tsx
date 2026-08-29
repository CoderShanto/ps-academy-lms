'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[] | string;
}

interface QuizData {
  id: number;
  documentId?: string;
  title: string;
  questions: Question[];
}

export default function StudentQuizPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}/take`);
        setQuiz(data.data);
      } catch (err: any) {
        console.error('Error fetching quiz:', err);
        setError('Quiz not found or unauthorized.');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchQuiz();
    }
  }, [id, user, authLoading, router]);

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post(`/quizzes/${id}/submit`, {
        answers: selectedAnswers,
      });
      setResult(data.result);
    } catch (err: any) {
      console.error('Quiz submission error:', err);
      setError(err.response?.data?.error?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-semibold">{error || 'Quiz not found'}</p>
        <Link href="/student" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/student" className="inline-flex items-center text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-indigo-200" />
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
          </div>
          <p className="text-indigo-100 text-sm mt-1">{quiz.questions.length} Questions Assessment</p>
        </div>

        {result ? (
          <div className="p-8 text-center">
            {result.passed ? (
              <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            ) : (
              <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-4">
                <XCircle className="h-12 w-12" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {result.passed ? 'Assessment Passed!' : 'Assessment Failed'}
            </h2>
            <p className="text-gray-600 mt-2">
              You scored <span className="font-bold text-indigo-600">{result.score}</span> out of{' '}
              <span className="font-bold">{result.total}</span> ({result.percentage}%)
            </p>

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => {
                  setResult(null);
                  setSelectedAnswers({});
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                Retake Quiz
              </button>
              <Link
                href="/student"
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {quiz.questions.map((q, qIdx) => {
              const rawOptions = q.options;
              const optionsArray: string[] = Array.isArray(rawOptions)
                ? rawOptions
                : typeof rawOptions === 'string'
                ? JSON.parse(rawOptions || '[]')
                : [];

              return (
                <div key={q.id || qIdx} className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {qIdx + 1}. {q.question}
                  </h3>

                  <div className="space-y-2">
                    {optionsArray.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleOptionSelect(qIdx, optIdx)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center space-x-3 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-medium'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting || Object.keys(selectedAnswers).length < quiz.questions.length}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm transition"
              >
                {submitting ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}