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
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  options?: string[];
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

  const handleOptionSelect = (questionKey: string | number, optionKey: string) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionKey]: optionKey,
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
      alert('Error evaluating quiz answers.');
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
      <Link href="/student" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="border-b border-gray-100 pb-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{questions.length} Multiple Choice Question{questions.length > 1 ? 's' : ''}</p>
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

              // Build option list from optionA, optionB, optionC, optionD
              const optionList = [
                { key: 'A', text: q.optionA },
                { key: 'B', text: q.optionB },
                { key: 'C', text: q.optionC },
                { key: 'D', text: q.optionD },
              ].filter((opt) => opt.text !== undefined && opt.text !== null && opt.text !== '');

              return (
                <div key={qKey} className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-4 text-base">
                    <span className="text-indigo-600 font-bold mr-2">Q{idx + 1}.</span>
                    {q.questionText}
                  </p>

                  <div className="space-y-2.5">
                    {optionList.map((opt) => {
                      const isSelected = selectedAnswers[qKey] === opt.key;
                      return (
                        <label
                          key={opt.key}
                          onClick={() => handleOptionSelect(qKey, opt.key)}
                          className={`flex items-center p-3.5 rounded-lg border cursor-pointer transition text-sm ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold'
                              : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${qKey}`}
                            value={opt.key}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(qKey, opt.key)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mr-3"
                          />
                          <span className="font-bold text-gray-500 mr-2">{opt.key}.</span>
                          <span>{opt.text}</span>
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