'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublishedBlogs() {
      try {
        // By default Strapi returns only published entries for public queries
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
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Latest Academy Insights</h1>
        <p className="mt-3 text-lg text-gray-600">
          Articles, tutorials, and engineering best practices published by our team.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600 font-medium">No published articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">{post.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {post.content || post.body || ''}
                </p>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <span className="text-sm font-semibold text-indigo-600 inline-flex items-center">
                  Read Article <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}