'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, GraduationCap, BookOpenCheck, ArrowRight } from 'lucide-react';

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
    <div className="relative min-h-[85vh] bg-[#05060A] overflow-hidden">
      {/* Ambient glow layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#7C3AED]/25 blur-[120px]" />
        <div className="blob-2 absolute top-10 right-[-120px] w-[480px] h-[480px] rounded-full bg-[#22D3EE]/20 blur-[120px]" />
        <div className="blob-3 absolute bottom-[-160px] left-1/3 w-[420px] h-[420px] rounded-full bg-[#EC4899]/15 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-4 py-1.5 mb-7">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22D3EE]" />
            </span>
            <span className="font-mono text-[11px] tracking-wide text-white/70">
              built on next.js + strapi
            </span>
          </div>

          <h1 className="text-5xl sm:text-[64px] font-bold text-white tracking-tight leading-[1.05]">
            Learn software
            <br />
            <span className="bg-gradient-to-r from-[#22D3EE] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent">
              the way you'll build it.
            </span>
          </h1>

          <p className="mt-7 text-lg text-white/60 max-w-xl leading-relaxed">
            PS Academy is a role-based learning platform — sequential lessons,
            server-graded quizzes, and access control enforced at the API layer
            across four distinct roles.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={dashboardHref}
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-[#05060A] overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#22D3EE] to-[#818CF8]" />
              <span className="relative">{user ? 'Go to Dashboard' : 'Get Started'}</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white border border-white/15 bg-white/[0.03] backdrop-blur hover:bg-white/[0.07] transition"
            >
              Explore Courses
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-white">4</p>
              <p className="text-xs text-white/40 font-mono mt-1">roles enforced</p>
            </div>
            <div className="w-px h-9 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-white/40 font-mono mt-1">answers leaked client-side</p>
            </div>
          </div>
        </div>

        {/* Signature: code panel */}
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-br from-[#22D3EE]/20 via-transparent to-[#C084FC]/20 rounded-2xl blur-xl" />
          <div className="relative rounded-2xl border border-white/10 bg-[#0B0D14]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]/70" />
              <span className="ml-3 font-mono text-[11px] text-white/40">rbac.ts</span>
            </div>

            <pre className="px-5 py-5 text-[13px] leading-[1.8] font-mono overflow-x-auto">
              <code>
                <span className="text-[#C084FC]">function</span>{' '}
                <span className="text-[#60A5FA]">authorize</span>
                <span className="text-white/70">(</span>
                <span className="text-white">user</span>
                <span className="text-white/50">: Role</span>
                <span className="text-white/70">{') {'}</span>
                {'\n  '}
                <span className="text-[#C084FC]">switch</span>
                <span className="text-white/70">(</span>
                <span className="text-white">user</span>
                <span className="text-white/70">{') {'}</span>
                {'\n    '}
                <span className="text-[#C084FC]">case</span>{' '}
                <span className="text-[#FBBF24]">'Admin'</span>
                <span className="text-white/70">:</span> <span className="text-[#C084FC]">return</span>{' '}
                <span className="text-[#34D399]">FULL_ACCESS</span>
                <span className="text-white/70">;</span>
                {'\n    '}
                <span className="text-[#C084FC]">case</span>{' '}
                <span className="text-[#FBBF24]">'Instructor'</span>
                <span className="text-white/70">:</span> <span className="text-[#C084FC]">return</span>{' '}
                <span className="text-[#34D399]">TEACH_ACCESS</span>
                <span className="text-white/70">;</span>
                {'\n    '}
                <span className="text-[#C084FC]">case</span>{' '}
                <span className="text-[#FBBF24]">'ContentManager'</span>
                <span className="text-white/70">:</span> <span className="text-[#C084FC]">return</span>{' '}
                <span className="text-[#34D399]">EDIT_ACCESS</span>
                <span className="text-white/70">;</span>
                {'\n    '}
                <span className="text-[#C084FC]">case</span>{' '}
                <span className="text-[#FBBF24]">'Student'</span>
                <span className="text-white/70">:</span> <span className="text-[#C084FC]">return</span>{' '}
                <span className="text-[#34D399]">LEARN_ACCESS</span>
                <span className="text-white/70">;</span>
                {'\n  '}
                <span className="text-white/70">{'}'}</span>
                {'\n'}
                <span className="text-white/70">{'}'}</span>
                <span className="cursor-blink text-[#22D3EE]">▌</span>
              </code>
            </pre>

            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-white/[0.02]">
              <span className="font-mono text-[10px] text-white/40">
                resolved server-side · per request
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#22D3EE]" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: BookOpenCheck,
            color: '#22D3EE',
            title: 'Sequential Lessons',
            desc: 'Video and text content ordered by course creators, with per-student progress tracking.',
          },
          {
            icon: GraduationCap,
            color: '#34D399',
            title: 'Auto-Graded Quizzes',
            desc: 'Assessments graded server-side — answer keys never reach the client.',
          },
          {
            icon: ShieldCheck,
            color: '#C084FC',
            title: 'Strict RBAC',
            desc: 'Four-role access control enforced on the backend across Admin, Instructor, Content Manager, and Student.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-7 hover:bg-white/[0.06] hover:border-white/20 transition"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
              style={{ background: `${f.color}1A` }}
            >
              <f.icon className="h-5 w-5" style={{ color: f.color }} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <style jsx>{`
        .blob {
          animation: drift1 16s ease-in-out infinite;
        }
        .blob-2 {
          animation: drift2 20s ease-in-out infinite;
        }
        .blob-3 {
          animation: drift1 18s ease-in-out infinite reverse;
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 40px); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 25px); }
        }
        .cursor-blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}