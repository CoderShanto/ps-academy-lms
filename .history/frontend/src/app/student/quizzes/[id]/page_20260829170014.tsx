'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { HelpCircle, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizData {
  id: number;
  title: string;
  questions: Question[];
}

interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  attemptId: number;
}

export default function StudentQuizPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}/take`);
        setQuiz(data.data);
      } catch (err) {
        console.error('Failed to load quiz', err);
        setError('Failed to load quiz questions.');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchQuiz();
    }
  }, [id, user, authLoading, router]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (result) return; // Prevent change after submit
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Validate that all questions are answered
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await api.post(`/quizzes/${id}/submit`, {
        answers: selectedAnswers,
      });
      setResult(data.result);
    } catch (err) {
      console.error('Quiz submit failed', err);
      setError('Failed to submit quiz.');
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
    return <div className="text-center py-20 text-gray-600">{error || 'Quiz not found.'}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/student" className="inline-flex items-center text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-7 w-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          </div>
          <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {quiz.questions.length} Questions
          </span>
        </div>

        {/* Results Banner if completed */}
        {result && (
          <div
            className={`p-6 rounded-xl mb-8 border ${
              result.passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              {result.passed ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <XCircle className="h-6 w-6 text-rose-600" />
              )}
              <h2 className="text-xl font-bold">
                {result.passed ? 'Quiz Passed!' : 'Quiz Needs Retake'}
              </h2>
            </div>
            <p className="text-sm">
              You scored <strong>{result.score}</strong> out of <strong>{result.total}</strong> ({result.percentage}%).
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Questions list */}
        <div className="space-y-8">
          {quiz.questions.map((q, qIdx) => (
            <div key={q.id || qIdx} className="p-5 rounded-xl bg-gray-50 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                {qIdx + 1}. {q.question}
              </h3>

              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition flex items-center justify-between border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span>{option}</span>
                      <span
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-white bg-white' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-600"></span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          {result ? (
            <button
              onClick={() => {
                setResult(null);
                setSelectedAnswers({});
              }}
              className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retake Quiz</span>
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Grading...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}