'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Newspaper, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  body: string;
  status: 'draft' | 'published';
  author?: {
    username: string;
  };
  createdAt: string;
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/blog-posts?populate=*');
        setPosts(data.data || []);
      } catch (err) {
        console.error('Failed to load blog posts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Articles & Announcements</h1>
        <p className="text-gray-600 mt-1">Read the latest insights from our academy educators</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No published articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">{post.body}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                <span className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" />
                  {post.author?.username || 'Academy Author'}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}