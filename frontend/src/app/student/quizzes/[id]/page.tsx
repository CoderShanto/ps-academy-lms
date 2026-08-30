'use client';

import { useEffect, useState, useCallback, use } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, Award } from 'lucide-react';

interface Question {
  id: number;
  documentId?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface Quiz {
  id: number;
  documentId?: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    passingScore: number;
    totalQuestions: number;
    correctCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Define fetchQuiz before useEffect using useCallback
  const fetchQuiz = useCallback(async () => {
    try {
      const { data } = await api.get(`/quizzes/${quizId}?populate=*`);
      setQuiz(data.data || null);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchQuiz();
      }
    }
  }, [user, authLoading, router, fetchQuiz]);

  const handleSelectOption = (qKey: string | number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qKey]: option }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/quiz-attempts/submit', {
        quizId,
        answers,
      });
      setResult(res.data.data);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit quiz attempt.');
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

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Quiz not found</h2>
        <Link href="/student" className="mt-4 inline-flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/student" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
      </Link>

      {result ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center">
          <div className="inline-flex p-4 rounded-full mb-4 bg-indigo-50 text-indigo-600">
            {result.passed ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            ) : (
              <XCircle className="h-12 w-12 text-rose-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {result.passed ? 'Assessment Passed!' : 'Assessment Failed'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            You scored {result.correctCount} out of {result.totalQuestions} questions correctly.
          </p>

          <div className="p-4 bg-gray-50 rounded-2xl max-w-xs mx-auto mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase">Final Score</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{result.score}%</p>
            <p className="text-xs text-gray-500 mt-1">Passing requirement: {result.passingScore}%</p>
          </div>

          <div className="flex justify-center space-x-3">
            <Link
              href="/student/quizzes"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition"
            >
              View All Results History
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl transition"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Passing criteria: {quiz.passingScore || 60}% • {quiz.questions?.length || 0} Questions
            </p>
          </div>

          {quiz.questions?.map((q, idx) => {
            const qKey = q.documentId || q.id;
            const selectedOpt = answers[qKey];

            return (
              <div key={q.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                <p className="font-bold text-gray-900 text-base">
                  {idx + 1}. {q.questionText}
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const text = q[`option${optKey}` as keyof Question];
                    if (!text) return null;
                    const isSelected = selectedOpt === optKey;

                    return (
                      <button
                        type="button"
                        key={optKey}
                        onClick={() => handleSelectOption(qKey, optKey)}
                        className={`p-3.5 rounded-xl border text-left text-sm font-medium transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                            : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <span>
                          <strong className="mr-2">{optKey}.</strong> {text}
                        </span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitting || Object.keys(answers).length === 0}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-sm transition disabled:opacity-50 text-base"
          >
            {submitting ? 'Submitting & Grading...' : 'Submit Assessment'}
          </button>
        </form>
      )}
    </div>
  );
}