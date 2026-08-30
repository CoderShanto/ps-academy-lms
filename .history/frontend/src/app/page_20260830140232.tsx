'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  BookOpen, Award, CheckCircle, ArrowRight, Users, TrendingUp, Clock,
  Shield, Zap, Target, Quote, Palette, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Theme Configuration
const themes = {
  indigo: {
    name: 'Indigo', primary: '#4f46e5',
    gradientDark: 'from-indigo-950 via-purple-950 to-slate-950',
    textGradient: 'from-indigo-600 to-purple-600',
    textGradientDark: 'from-indigo-400 to-purple-400',
    button: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    buttonShadow: 'shadow-indigo-600/30',
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/50',
    statBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    statIcon: 'text-indigo-600 dark:text-indigo-400',
    cardHover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    ctaGradient: 'from-indigo-600 to-purple-700',
    testimonialQuote: 'text-indigo-600 dark:text-indigo-400',
    link: 'text-indigo-600 dark:text-indigo-400',
  },
  emerald: {
    name: 'Emerald', primary: '#059669',
    gradientDark: 'from-emerald-950 via-teal-950 to-slate-950',
    textGradient: 'from-emerald-600 to-teal-600',
    textGradientDark: 'from-emerald-400 to-teal-400',
    button: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600',
    buttonShadow: 'shadow-emerald-600/30',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    statBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    statIcon: 'text-emerald-600 dark:text-emerald-400',
    cardHover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    ctaGradient: 'from-emerald-600 to-teal-700',
    testimonialQuote: 'text-emerald-600 dark:text-emerald-400',
    link: 'text-emerald-600 dark:text-emerald-400',
  },
  rose: {
    name: 'Rose', primary: '#e11d48',
    gradientDark: 'from-rose-950 via-pink-950 to-slate-950',
    textGradient: 'from-rose-600 to-pink-600',
    textGradientDark: 'from-rose-400 to-pink-400',
    button: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600',
    buttonShadow: 'shadow-rose-600/30',
    iconBg: 'bg-rose-50 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/50',
    statBg: 'bg-rose-50 dark:bg-rose-900/20',
    statIcon: 'text-rose-600 dark:text-rose-400',
    cardHover: 'hover:border-rose-300 dark:hover:border-rose-700',
    ctaGradient: 'from-rose-600 to-pink-700',
    testimonialQuote: 'text-rose-600 dark:text-rose-400',
    link: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    name: 'Amber', primary: '#d97706',
    gradientDark: 'from-amber-950 via-orange-950 to-slate-950',
    textGradient: 'from-amber-600 to-orange-600',
    textGradientDark: 'from-amber-400 to-orange-400',
    button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
    buttonShadow: 'shadow-amber-600/30',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/50',
    statBg: 'bg-amber-50 dark:bg-amber-900/20',
    statIcon: 'text-amber-600 dark:text-amber-400',
    cardHover: 'hover:border-amber-300 dark:hover:border-amber-700',
    ctaGradient: 'from-amber-600 to-orange-700',
    testimonialQuote: 'text-amber-600 dark:text-amber-400',
    link: 'text-amber-600 dark:text-amber-400',
  },
  cyan: {
    name: 'Cyan', primary: '#0891b2',
    gradientDark: 'from-cyan-950 via-blue-950 to-slate-950',
    textGradient: 'from-cyan-600 to-blue-600',
    textGradientDark: 'from-cyan-400 to-blue-400',
    button: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600',
    buttonShadow: 'shadow-cyan-600/30',
    iconBg: 'bg-cyan-50 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-100 dark:border-cyan-900/50',
    statBg: 'bg-cyan-50 dark:bg-cyan-900/20',
    statIcon: 'text-cyan-600 dark:text-cyan-400',
    cardHover: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    ctaGradient: 'from-cyan-600 to-blue-700',
    testimonialQuote: 'text-cyan-600 dark:text-cyan-400',
    link: 'text-cyan-600 dark:text-cyan-400',
  },
  purple: {
    name: 'Purple', primary: '#7c3aed',
    gradientDark: 'from-purple-950 via-violet-950 to-slate-950',
    textGradient: 'from-purple-600 to-violet-600',
    textGradientDark: 'from-purple-400 to-violet-400',
    button: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
    buttonShadow: 'shadow-purple-600/30',
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/50',
    statBg: 'bg-purple-50 dark:bg-purple-900/20',
    statIcon: 'text-purple-600 dark:text-purple-400',
    cardHover: 'hover:border-purple-300 dark:hover:border-purple-700',
    ctaGradient: 'from-purple-600 to-violet-700',
    testimonialQuote: 'text-purple-600 dark:text-purple-400',
    link: 'text-purple-600 dark:text-purple-400',
  },
};

const colorOptions = [
  { key: 'indigo', color: '#4f46e5', label: 'Indigo' },
  { key: 'emerald', color: '#059669', label: 'Emerald' },
  { key: 'rose', color: '#e11d48', label: 'Rose' },
  { key: 'amber', color: '#d97706', label: 'Amber' },
  { key: 'cyan', color: '#0891b2', label: 'Cyan' },
  { key: 'purple', color: '#7c3aed', label: 'Purple' },
];

//  Rotating words for the hero headline
const rotatingSkills = [
  'Software Skills',
  'Cloud Architecture',
  'Data Science',
  'DevOps Practices',
  'AI & Machine Learning',
  'Cybersecurity',
  'Full-Stack Development',
  'System Design',
];

export default function Home() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [colorTheme, setColorTheme] = useState<keyof typeof themes>('indigo');
  const [showThemePanel, setShowThemePanel] = useState(false);
  
  //  Rotating text state
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const theme = themes[colorTheme];

  useEffect(() => {
    setIsVisible(true);
    const savedTheme = localStorage.getItem('theme-color');
    const savedMode = localStorage.getItem('theme-mode');
    if (savedTheme && themes[savedTheme as keyof typeof themes]) {
      setColorTheme(savedTheme as keyof typeof themes);
    }
    if (savedMode === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  //  Auto-rotate the skill word every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      // Wait for fade-out, then change word, then fade-in
      setTimeout(() => {
        setCurrentSkillIndex((prev) => (prev + 1) % rotatingSkills.length);
        setIsAnimating(false);
      }, 400); // matches CSS transition duration
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme-mode', 'light');
    }
  };

  const changeColorTheme = (key: keyof typeof themes) => {
    setColorTheme(key);
    localStorage.setItem('theme-color', key);
  };

  const stats = [
    { label: 'Active Learners', value: '5,000+', icon: Users, color: theme.statIcon, bgColor: theme.statBg },
    { label: 'Courses Completed', value: '12,500+', icon: Award, color: theme.statIcon, bgColor: theme.statBg },
    { label: 'Avg. Completion Rate', value: '87%', icon: TrendingUp, color: theme.statIcon, bgColor: theme.statBg },
    { label: 'Learning Hours', value: '45,000+', icon: Clock, color: theme.statIcon, bgColor: theme.statBg },
  ];

  const features = [
    { icon: BookOpen, title: 'Sequential Learning Paths', description: 'Structured curriculum with video and textual content, progress tracking, and milestone achievements.', color: theme.iconColor, bgColor: theme.iconBg, borderColor: theme.border },
    { icon: Award, title: 'Automated Assessments', description: 'AI-powered quizzes with instant feedback, server-side grading, and detailed performance analytics.', color: theme.iconColor, bgColor: theme.iconBg, borderColor: theme.border },
    { icon: Shield, title: 'Enterprise-Grade Security', description: 'Role-based access control (RBAC) with 4-tier permissions ensuring data privacy and compliance.', color: theme.iconColor, bgColor: theme.iconBg, borderColor: theme.border },
    { icon: Zap, title: 'Real-Time Progress Tracking', description: 'Live dashboards for learners and administrators with actionable insights and completion metrics.', color: theme.iconColor, bgColor: theme.iconBg, borderColor: theme.border },
    { icon: Target, title: 'Skill-Based Certification', description: 'Industry-recognized certificates upon completion with verifiable credentials and badges.', color: theme.iconColor, bgColor: theme.iconBg, borderColor: theme.border },
    { icon: CheckCircle, title: 'SCORM Compliant', description: 'Compatible with industry standards for seamless integration with existing LMS ecosystems.', color: theme.iconColor, bgColor: theme.iconBg, borderColor: theme.border },
  ];

  const testimonials = [
    { quote: "PS Academy transformed our employee onboarding. Training time reduced by 40% with measurable skill improvements.", author: "Sarah Mitchell", role: "HR Director", company: "TechCorp Industries" },
    { quote: "The role-based access and sequential learning paths make it perfect for our compliance training requirements.", author: "Michael Chen", role: "Learning & Development Manager", company: "Global Finance Corp" },
    { quote: "Finally, an LMS that combines enterprise security with an intuitive learner experience. Highly recommended.", author: "Jennifer Adams", role: "Chief People Officer", company: "InnovateTech" },
  ];

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${isDark ? 'dark bg-slate-950' : 'bg-white'}`}>
      
      {/* Theme Switcher */}
      <div className="fixed top-24 right-6 z-50 flex flex-col items-end gap-3">
        <button
          onClick={() => setShowThemePanel(!showThemePanel)}
          className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
            isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-gray-800 border border-gray-200'
          }`}
          title="Theme Settings"
        >
          <Palette className="h-5 w-5" />
        </button>

        {showThemePanel && (
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all ${
            isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </span>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                  isDark ? 'left-8 bg-slate-900 text-yellow-400' : 'left-1 bg-white text-orange-500'
                }`}>
                  {isDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                </div>
              </button>
            </div>
            <div className="mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Color Theme
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => changeColorTheme(option.key as keyof typeof themes)}
                  className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    colorTheme === option.key
                      ? isDark ? 'bg-slate-800' : 'bg-gray-100'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full transition-transform group-hover:scale-110 ${
                      colorTheme === option.key ? 'ring-2 ring-offset-2 scale-110' : ''
                    }`}
                    style={{ 
                      backgroundColor: option.color,
                      ringColor: option.color,
                      ringOffsetColor: isDark ? '#0f172a' : '#ffffff'
                    }}
                  />
                  <span className={`text-[10px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${theme.gradientDark} text-white overflow-hidden transition-all duration-700`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ backgroundColor: theme.primary }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: theme.primary }}></div>
        
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-medium text-white/90">Trusted by 500+ Organizations Worldwide</span>
            </div>
            
            {/*  ANIMATED HEADLINE */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 min-h-[1.2em]">
              Master{' '}
              <span className="inline-block relative">
                <span 
                  className={`inline-block transition-all duration-400 ease-in-out ${
                    isAnimating 
                      ? 'opacity-0 translate-y-4 blur-sm' 
                      : 'opacity-100 translate-y-0 blur-0'
                  }`}
                >
                  <span className={`bg-gradient-to-r ${isDark ? theme.textGradientDark : theme.textGradient} bg-clip-text text-transparent transition-all duration-500`}>
                    {rotatingSkills[currentSkillIndex]}
                  </span>
                </span>
              </span>
              {' '}with{' '}
              <span className={`bg-gradient-to-r ${isDark ? theme.textGradientDark : theme.textGradient} bg-clip-text text-transparent transition-all duration-500`}>
                PS Academy
              </span>
            </h1>
            
            {/* Typing indicator dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {rotatingSkills.map((_, idx) => (
                <span 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSkillIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade learning management platform built for modern teams. 
              Deliver structured training, track progress in real-time, and measure learning outcomes with precision.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Link
                  href={
                    user.role?.name === 'Admin' ? '/admin'
                    : user.role?.name === 'Instructor' ? '/instructor'
                    : user.role?.name === 'Content Manager' ? '/content-manager'
                    : '/student'
                  }
                  className={`inline-flex items-center justify-center space-x-2 ${theme.button} text-white font-semibold px-8 py-4 rounded-xl shadow-lg ${theme.buttonShadow} transition-all hover:scale-105`}
                >
                  <span>Access Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link href="/register" className={`inline-flex items-center justify-center ${theme.button} text-white font-semibold px-8 py-4 rounded-xl shadow-lg ${theme.buttonShadow} transition-all hover:scale-105`}>
                    Start Free Trial
                  </Link>
                  <Link href="/courses" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all">
                    Explore Courses
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-4">Trusted by industry leaders</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <span className="text-lg font-semibold">Google</span>
                <span className="text-lg font-semibold">Microsoft</span>
                <span className="text-lg font-semibold">Amazon</span>
                <span className="text-lg font-semibold">Meta</span>
                <span className="text-lg font-semibold">Apple</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${isDark ? 'from-slate-950' : 'from-white'} to-transparent transition-colors duration-500`}></div>
      </section>

      {/* Statistics Section */}
      <section className={`py-16 ${isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-gray-200'} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className={`text-center p-6 rounded-2xl ${stat.bgColor} border ${theme.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3 transition-colors duration-500`} />
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>{stat.value}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-24 ${isDark ? 'bg-slate-950' : 'bg-gray-50'} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Why Organizations Choose PS Academy
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Comprehensive learning management features designed for enterprise needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`group p-8 ${isDark ? 'bg-slate-900' : 'bg-white'} rounded-2xl border-2 ${feature.borderColor} ${theme.cardHover} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color} transition-colors duration-500`} />
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>{feature.title}</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-24 ${isDark ? 'bg-slate-900' : 'bg-white'} transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Loved by HR Teams Worldwide
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              See what learning and development professionals say about PS Academy
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`p-8 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'} rounded-2xl border hover:shadow-lg transition-all duration-300`}>
                <Quote className={`h-10 w-10 ${theme.testimonialQuote} mb-4 opacity-50 transition-colors duration-500`} />
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-6 leading-relaxed italic`}>"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}dd)` }}>
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{testimonial.author}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{testimonial.role}</div>
                    <div className={`text-sm ${theme.link} font-medium`}>{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 bg-gradient-to-br ${theme.ctaGradient} text-white transition-all duration-700`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Transform Your Learning Program?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of organizations already using PS Academy to deliver exceptional learning experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center bg-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ color: theme.primary }}>
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all">
              Schedule a Demo
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/70">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">PS Academy</h3>
              <p className="text-sm text-gray-400">Enterprise learning management for modern organizations.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm text-gray-500">
            © 2026 PS Academy. All rights reserved. SOC 2 Type II Certified.
          </div>
        </div>
      </footer>
    </div>
  );
}