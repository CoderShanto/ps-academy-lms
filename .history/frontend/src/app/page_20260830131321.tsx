'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Clock,
  Shield,
  Zap,
  Target,
  Quote
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Statistics data - HR loves metrics!
  const stats = [
    { label: 'Active Learners', value: '5,000+', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Courses Completed', value: '12,500+', icon: Award, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Avg. Completion Rate', value: '87%', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Learning Hours', value: '45,000+', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  // Features with enhanced details
  const features = [
    {
      icon: BookOpen,
      title: 'Sequential Learning Paths',
      description: 'Structured curriculum with video and textual content, progress tracking, and milestone achievements.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      icon: Award,
      title: 'Automated Assessments',
      description: 'AI-powered quizzes with instant feedback, server-side grading, and detailed performance analytics.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'Role-based access control (RBAC) with 4-tier permissions ensuring data privacy and compliance.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      icon: Zap,
      title: 'Real-Time Progress Tracking',
      description: 'Live dashboards for learners and administrators with actionable insights and completion metrics.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      icon: Target,
      title: 'Skill-Based Certification',
      description: 'Industry-recognized certificates upon completion with verifiable credentials and badges.',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100'
    },
    {
      icon: CheckCircle,
      title: 'SCORM Compliant',
      description: 'Compatible with industry standards for seamless integration with existing LMS ecosystems.',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-100'
    }
  ];

  // Testimonials - Social proof HR loves
  const testimonials = [
    {
      quote: "PS Academy transformed our employee onboarding. Training time reduced by 40% with measurable skill improvements.",
      author: "Sarah Mitchell",
      role: "HR Director",
      company: "TechCorp Industries"
    },
    {
      quote: "The role-based access and sequential learning paths make it perfect for our compliance training requirements.",
      author: "Michael Chen",
      role: "Learning & Development Manager",
      company: "Global Finance Corp"
    },
    {
      quote: "Finally, an LMS that combines enterprise security with an intuitive learner experience. Highly recommended.",
      author: "Jennifer Adams",
      role: "Chief People Officer",
      company: "InnovateTech"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-medium text-white/90">Trusted by 500+ Organizations Worldwide</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              Master Software Skills with{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                PS Academy
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade learning management platform built for modern teams. 
              Deliver structured training, track progress in real-time, and measure learning outcomes with precision.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
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
                  className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <span>Access Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href="/courses"
                    className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all"
                  >
                    Explore Courses
                  </Link>
                </>
              )}
            </div>

            {/* Trust badges */}
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

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Statistics Section - HR Loves Metrics! */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center p-6 rounded-2xl ${stat.bgColor} border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Organizations Choose PS Academy
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive learning management features designed for enterprise needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group p-8 bg-white rounded-2xl border-2 ${feature.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Social Proof */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by HR Teams Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what learning and development professionals say about PS Academy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <Quote className="h-10 w-10 text-indigo-600 mb-4 opacity-50" />
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-indigo-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Learning Program?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of organizations already using PS Academy to deliver exceptional learning experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-white text-indigo-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center bg-indigo-500/50 hover:bg-indigo-500/70 backdrop-blur-sm border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all"
            >
              Schedule a Demo
            </Link>
          </div>
          <p className="mt-6 text-sm text-indigo-200">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-gray-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">PS Academy</h3>
              <p className="text-sm text-gray-400">
                Enterprise learning management for modern organizations.
              </p>
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