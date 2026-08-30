'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  GraduationCap,
  BookOpenCheck,
  Check,
  Minus,
  ArrowRight,
} from 'lucide-react';

const MATRIX = [
  { role: 'Admin', users: true, courses: true, grading: true, access: true },
  { role: 'Instructor', users: false, courses: true, grading: true, access: true },
  { role: 'Content Mgr', users: false, courses: true, grading: false, access: false },
  { role: 'Student', users: false, courses: false, grading: false, access: true },
];

const COLS = [
  { key: 'users', label: 'Manage Users' },
  { key: 'courses', label: 'Create Courses' },
  { key: 'grading', label: 'Grade Quizzes' },
  { key: 'access', label: 'Access Content' },
] as const;

export default function Home() {
  const { user } = useAuth();

  const dashboardHref = user
    ? user.role?.name === 'Admin'
      ? '/admin'
      : user.role?.name === 'Instructor'
      ? '/instructor'
      : user.role?.name === 'Content Manager'
      ? '/content-manager'
      : '/student'
    : '/register';

  return (
    <div className="min-h-[85vh] bg-[#F6F7F5]">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
        {/* Left: copy */}
        <div>
          <div className="inline-flex items-center gap-2 border border-[#E2E4E0] bg-white px-3 py-1.5 rounded-md mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2F6FED] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6470]">
              role-based access · enforced server-side
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-[#0B0E14] tracking-tight leading-[1.05]">
            Learning infrastructure,
            <br />
            not another course app.
          </h1>

          <p className="mt-6 text-lg text-[#5B6470] max-w-xl leading-relaxed">
            PS Academy is a role-based learning platform built on Next.js and Strapi —
            sequential lessons, auto-graded quizzes, and permissions enforced on the
            backend across four distinct roles.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-2 bg-[#0B0E14] hover:bg-[#1a1f2b] text-white font-semibold px-6 py-3 rounded-md transition"
            >
              <span>{user ? 'Go to Dashboard' : 'Get Started'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#F0F1EE] border border-[#E2E4E0] text-[#0B0E14] font-semibold px-6 py-3 rounded-md transition"
            >
              Explore Courses
            </Link>
          </div>
        </div>

        {/* Right: signature — permission matrix */}
        <div className="border border-[#E2E4E0] bg-white rounded-lg overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E4E0] bg-[#FAFAF9]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6470]">
              access_control.matrix
            </span>
            <ShieldCheck className="h-4 w-4 text-[#2F6FED]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E4E0]">
                  <th className="text-left font-mono text-[11px] uppercase tracking-wider text-[#5B6470] px-5 py-3">
                    Role
                  </th>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      className="text-center font-mono text-[10px] uppercase tracking-wider text-[#5B6470] px-2 py-3"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, i) => (
                  <tr
                    key={row.role}
                    className={i !== MATRIX.length - 1 ? 'border-b border-[#F0F1EE]' : ''}
                  >
                    <td className="px-5 py-3 font-semibold text-[#0B0E14] whitespace-nowrap">
                      {row.role}
                    </td>
                    {COLS.map((c) => (
                      <td key={c.key} className="text-center px-2 py-3">
                        {row[c.key] ? (
                          <Check className="h-4 w-4 text-[#1F8A5F] inline" />
                        ) : (
                          <Minus className="h-4 w-4 text-[#C7C9C4] inline" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-[#E2E4E0] bg-[#FAFAF9]">
            <span className="font-mono text-[10px] text-[#5B6470]">
              permissions resolved per request · not per client state
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#E2E4E0] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E2E4E0] border border-[#E2E4E0] rounded-lg overflow-hidden">
          <div className="bg-white p-8 hover:bg-[#FAFAF9] transition">
            <BookOpenCheck className="h-5 w-5 text-[#2F6FED] mb-4" />
            <h3 className="text-base font-bold text-[#0B0E14] mb-2">Sequential Lessons</h3>
            <p className="text-sm text-[#5B6470] leading-relaxed">
              Video and text content ordered by course creators, with per-student
              progress tracking.
            </p>
          </div>

          <div className="bg-white p-8 hover:bg-[#FAFAF9] transition">
            <GraduationCap className="h-5 w-5 text-[#1F8A5F] mb-4" />
            <h3 className="text-base font-bold text-[#0B0E14] mb-2">Auto-Graded Quizzes</h3>
            <p className="text-sm text-[#5B6470] leading-relaxed">
              Assessments graded server-side — answer keys never reach the client.
            </p>
          </div>

          <div className="bg-white p-8 hover:bg-[#FAFAF9] transition">
            <ShieldCheck className="h-5 w-5 text-[#0B0E14] mb-4" />
            <h3 className="text-base font-bold text-[#0B0E14] mb-2">Strict RBAC</h3>
            <p className="text-sm text-[#5B6470] leading-relaxed">
              Four-role access control enforced on the backend across Admin,
              Instructor, Content Manager, and Student.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}