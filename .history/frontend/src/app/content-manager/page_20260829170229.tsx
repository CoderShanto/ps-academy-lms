'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, Newspaper, Send, Edit3, Trash2 } from 'lucide-react';
import { isAxiosError } from 'axios';

interface BlogPost {
  id: number;
  title: string;
  body: string;
  status: 'draft' | 'published';
}

export default function ContentManagerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/blog-posts');
      setPosts(data.data || []);
    } catch (err) {
      console.error('Failed to load blog posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role?.name !== 'Content Manager' && user.role?.name !== 'Admin')) {
        router.push('/login');
        return;
      }
      fetchPosts();
    }
  }, [user, authLoading, router]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setSaving(true);
    try {
      await api.post('/blog-posts', {
        data: {
          title,
          body,
          status,
        },
      });
      setTitle('');
      setBody('');
      setStatus('draft');
      fetchPosts();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.error?.message || 'Failed to publish post');
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Management Studio</h1>
        <p className="text-gray-600 mt-1">Publish and manage academy articles with Draft vs Published states</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creator Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-indigo-600" />
            Write New Article
          </h2>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea
                rows={6}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-indigo-500 bg-white"
              >
                <option value="draft">Draft (Visible only to Editors)</option>
                <option value="published">Published (Live to Public)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition text-sm disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Save Article'}
            </button>
          </form>
        </div>

        {/* Existing Articles Table */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Newspaper className="h-5 w-5 mr-2 text-indigo-600" />
            Existing Articles ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
              No articles found.
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-gray-900">{post.title}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{post.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}