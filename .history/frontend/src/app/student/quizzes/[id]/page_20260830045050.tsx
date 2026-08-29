'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Award, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  documentId?: string;
  questionText: string;
  options: string[] | string;
  correctAnswer?: string;
}

interface Quiz {
  id: number;
  documentId?: string;
  title: string;
  questions?: Question[];
}

export default function StudentQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string | number, string>>({});
  const [result, setResult] = useState<{ score: number; correctCount: number; totalQuestions: number; passed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadQuizData() {
      try {
        const { data } = await api.get(`/quizzes/${quizId}?populate=*`);
        setQuiz(data.data || null);

        // Check if previously attempted
        try {
          const attemptRes = await api.get(`/quizzes/${quizId}/my-attempt`);
          if (attemptRes.data?.attempt) {
            setResult({
              score: attemptRes.data.attempt.score,
              correctCount: 0,
              totalQuestions: 0,
              passed: attemptRes.data.attempt.passed,
            });
          }
        } catch {
          // No prior attempt found
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadQuizData();
    }
  }, [quizId, user, authLoading, router]);

  const handleOptionSelect = (questionKey: string | number, option: string) => {
    if (result) return; // Prevent edits after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionKey]: option,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/quizzes/${quizId}/submit`, {
        answers: selectedAnswers,
      });
      setResult(data);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Error submitting quiz answers.');
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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Quiz not found</h2>
        <Link href="/student" className="mt-4 inline-flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/student" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="border-b border-gray-100 pb-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{questions.length} Multiple Choice Questions</p>
          </div>
          <Award className="h-8 w-8 text-indigo-600" />
        </div>

        {result ? (
          <div className="text-center py-8">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {result.passed ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
            </div>
            <h2 className="text-3xl font-black text-gray-900">{result.score}%</h2>
            <p className={`text-base font-semibold mt-1 ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>
              {result.passed ? 'Passed! Excellent work.' : 'Needs Improvement (Passing score is 60%)'}
            </p>

            <button
              onClick={() => {
                setResult(null);
                setSelectedAnswers({});
              }}
              className="mt-6 inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retake Quiz
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((q, idx) => {
              const qKey = q.id || q.documentId || idx;
              const optionsList: string[] = Array.isArray(q.options)
                ? q.options
                : typeof q.options === 'string'
                ? JSON.parse(q.options)
                : [];

              return (
                <div key={qKey} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="font-semibold text-gray-900 mb-3 text-base">
                    <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                    {q.questionText}
                  </p>

                  <div className="space-y-2">
                    {optionsList.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qKey] === opt;
                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleOptionSelect(qKey, opt)}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition text-sm ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-medium'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${qKey}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(qKey, opt)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mr-3"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button
              type="submit"
              disabled={submitting || Object.keys(selectedAnswers).length === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 text-base shadow-sm"
            >
              {submitting ? 'Evaluating Answers...' : 'Submit Quiz'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}