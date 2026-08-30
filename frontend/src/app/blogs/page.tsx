'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight, Edit, PlusCircle } from 'lucide-react';

interface BlogPost {
  id: number;
  documentId?: string;
  title: string;
  content?: string;
  body?: string;
  publishedAt?: string | null;
  createdAt?: string;
}

export default function BlogListingPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if current user is Admin or Content Manager
  const userRole = (user?.role?.name || user?.role?.type || '').toLowerCase();
  const canManageArticles = userRole.includes('admin') || userRole.includes('content') || userRole.includes('manager');

  useEffect(() => {
    async function loadPublishedBlogs() {
      try {
        const { data } = await api.get('/blog-posts?populate=*');
        setBlogs(data.data || []);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublishedBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Banner with Admin/Manager Studio Access */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Latest Academy Insights</h1>
          <p className="mt-2 text-base text-gray-400">
            Articles, tutorials, and engineering best practices published by our team.
          </p>
        </div>

        {canManageArticles && (
          <Link
            href="/content-manager"
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm self-start md:self-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Manage & Write Articles
          </Link>
        )}
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600 font-medium">No published articles yet. Check back soon!</p>
          {canManageArticles && (
            <Link
              href="/content-manager"
              className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:underline"
            >
              Write the first article &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => {
            const postKey = post.documentId || post.id;
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <span>
                        {new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {canManageArticles && (
                      <Link
                        href="/content-manager"
                        className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center bg-amber-50 px-2 py-0.5 rounded-md"
                        title="Edit in Content Studio"
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Link>
                    )}
                  </div>

                  <Link href={`/blogs/${postKey}`}>
                    <h2 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {post.content || post.body || 'Read full article for details.'}
                  </p>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/blogs/${postKey}`}
                    className="text-sm font-semibold text-indigo-600 inline-flex items-center"
                  >
                    Read Article <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}