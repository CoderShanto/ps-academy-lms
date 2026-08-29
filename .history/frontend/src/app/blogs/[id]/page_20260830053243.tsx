'use client';

import { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

interface BlogPost {
  id: number;
  documentId?: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
}

export default function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const { data } = await api.get(`/blog-posts/${postId}?populate=*`);
        setPost(data.data || null);
      } catch (err) {
        console.error('Failed to load blog post:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Article Not Found</h2>
        <Link href="/blogs" className="mt-4 inline-flex items-center text-indigo-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to all articles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/blogs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-8">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to all articles
      </Link>

      <article className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-4">
          <Calendar className="h-4 w-4 text-indigo-600" />
          <span>
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
          {post.title}
        </h1>

        <div className="text-gray-800 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>
    </div>
  );
}