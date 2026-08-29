'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Award, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-[85vh]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            Next-Gen Learning Platform
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Master Software Skills with <span className="text-indigo-600">PS Academy</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Role-based learning environment built with Next.js and Strapi. Complete sequential lessons, take quizzes, and track your progress in real-time.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            {user ? (
              <Link
                href={
                  user.role?.name === 'Admin'
                    ? '/admin'
                    : user.role?.name === 'Instructor'
                    ? '/instructor'
                    : user.role?.name === 'Content Manager'
                    ? '/content-manager'
                    : '/student'
                }
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/courses"
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition"
                >
                  Explore Courses
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sequential Lessons</h3>
          <p className="text-sm text-gray-600">
            Learn with video and textual content ordered by course creators with tracking.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-4">
            <Award className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Auto-Graded Quizzes</h3>
          <p className="text-sm text-gray-600">
            Submit assessments graded server-side without leaking answers to the client.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-3 bg-purple-50 rounded-xl w-fit mb-4">
            <CheckCircle className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Strict RBAC</h3>
          <p className="text-sm text-gray-600">
            4-Role Access Control enforced on the backend across Admin, Manager, Instructor, and Student.
          </p>
        </div>
      </section>
    </div>
  );
}