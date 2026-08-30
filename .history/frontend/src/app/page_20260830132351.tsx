'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  GraduationCap,
  BookOpenCheck,
  Layers,
  ArrowRight,
  Check,
  LogIn,
  ClipboardCheck,
  BarChart3,
  Sparkles,
} from 'lucide-react';

const ROTATING_WORDS = ['build it.', 'ship it.', 'debug it.', 'deploy it.', 'test it.'];

const ROLES = [
  {
    name: 'Admin',
    color: '#22D3EE',
    icon: ShieldCheck,
    desc: 'Oversee the entire academy',
    perms: ['Manage users', 'Configure roles & permissions', 'Monitor platform analytics'],
  },
  {
    name: 'Instructor',
    color: '#818CF8',
    icon: GraduationCap,
    desc: 'Teach and evaluate',
    perms: ['Create structured courses', 'Grade student assessments', 'Track class performance'],
  },
  {
    name: 'Content Manager',
    color: '#EC4899',
    icon: Layers,
    desc: 'Curate the curriculum',
    perms: ['Design lesson content', 'Organize course modules', 'Publish to the catalog'],
  },
  {
    name: 'Student',
    color: '#34D399',
    icon: BookOpenCheck,
    desc: 'Learn at your own pace',
    perms: ['Enroll in courses', 'Complete quizzes', 'Track personal progress'],
  },
];

const STEPS = [
  { n: '01', icon: LogIn, title: 'Enroll', desc: 'Pick a learning path suited to your goals.' },
  { n: '02', icon: BookOpenCheck, title: 'Learn', desc: 'Work through sequential video and text lessons.' },
  { n: '03', icon: ClipboardCheck, title: 'Assess', desc: 'Complete quizzes with instant, automated grading.' },
  { n: '04', icon: BarChart3, title: 'Track', desc: 'Watch your progress update in real time.' },
];

const FEATURES = [
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
    desc: 'Assessments are graded instantly, giving learners immediate feedback.',
  },
  {
    icon: ShieldCheck,
    color: '#C084FC',
    title: 'Role-Based Access',
    desc: 'Admin, Instructor, Content Manager, and Student each get a dedicated, permission-scoped workspace.',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

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
    <div className="relative bg-[#05060A]">
      {/* Ambient glow layer — spans the whole page */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        <div className="blob absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#7C3AED]/20 blur-[120px]" />
        <div className="blob-2 absolute top-10 right-[-120px] w-[480px] h-[480px] rounded-full bg-[#22D3EE]/15 blur-[120px]" />
        <div className="blob-3 absolute bottom-[-160px] left-1/3 w-[420px] h-[420px] rounded-full bg-[#EC4899]/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* HERO */}
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
            the way you'll{' '}
            <span className="relative inline-block align-bottom overflow-hidden" style={{ minWidth: '9ch', height: '1.05em' }}>
              <span
                key={wordIndex}
                className="word-anim inline-block bg-gradient-to-r from-[#22D3EE] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent absolute left-0 top-0 whitespace-nowrap"
              >
                {ROTATING_WORDS[wordIndex]}
              </span>
              <span className="invisible">{ROTATING_WORDS[0]}</span>
            </span>
          </h1>

          <p className="mt-7 text-lg text-white/60 max-w-xl leading-relaxed">
            PS Academy is a role-based learning platform — sequential lessons,
            auto-graded quizzes, and a dedicated dashboard for every role, from
            administrators to students.
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
              <p className="text-xs text-white/40 font-mono mt-1">dedicated roles</p>
            </div>
            <div className="w-px h-9 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-white/40 font-mono mt-1">instant quiz grading</p>
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
                access resolved automatically per role
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#22D3EE]" />
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="max-w-2xl mb-12">
          <span className="font-mono text-[11px] tracking-wide text-[#22D3EE]">02 · roles</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            A workspace for every role in your academy.
          </h2>
          <p className="mt-4 text-white/50 leading-relaxed">
            Administrators, instructors, content teams, and students each get an
            experience tailored to what they need to do.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ROLES.map((r) => (
            <div
              key={r.name}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 hover:bg-white/[0.06] hover:border-white/20 transition"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                style={{ background: `${r.color}1A` }}
              >
                <r.icon className="h-5 w-5" style={{ color: r.color }} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{r.name}</h3>
              <p className="text-xs text-white/40 mb-4">{r.desc}</p>
              <ul className="space-y-2">
                {r.perms.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-[13px] text-white/60">
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color: r.color }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="max-w-2xl mb-14">
          <span className="font-mono text-[11px] tracking-wide text-[#818CF8]">03 · how it works</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            From enrollment to mastery.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-[#05060A] p-7 relative">
              <span className="font-mono text-xs text-white/25">{s.n}</span>
              <s.icon className="h-5 w-5 text-[#22D3EE] mt-4 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY PS ACADEMY */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="max-w-2xl mb-12">
          <span className="font-mono text-[11px] tracking-wide text-[#EC4899]">04 · why PS Academy</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Designed for real classrooms.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-7 hover:bg-white/[0.06] hover:border-white/20 transition"
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
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative max-w-7xl mx-auto px-6 pb-28 pt-8 border-t border-white/5">
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur px-10 py-16 text-center overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#22D3EE]/10 via-[#818CF8]/10 to-[#C084FC]/10 blur-2xl" />
          <Sparkles className="relative h-6 w-6 text-[#22D3EE] mx-auto mb-5" />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to start learning?
          </h2>
          <p className="relative text-white/50 max-w-md mx-auto mb-8">
            Create an account and get access to your role's dashboard immediately.
          </p>
          <Link
            href={dashboardHref}
            className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-[#05060A] bg-gradient-to-r from-[#22D3EE] to-[#818CF8]"
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <style jsx>{`
        .blob { animation: drift1 16s ease-in-out infinite; }
        .blob-2 { animation: drift2 20s ease-in-out infinite; }
        .blob-3 { animation: drift1 18s ease-in-out infinite reverse; }
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 40px); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 25px); }
        }
        .cursor-blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .word-anim { animation: wordIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes wordIn {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}