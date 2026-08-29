'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PlusCircle, FileText, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { isAxiosError } from 'axios';

interface BlogPost {
  id: number;
  documentId?: string;
  title: string;
  content?: string;
  publishedAt?: string | null;
  createdAt?: string;
}

export default function ContentManagerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const fetchArticles = useCallback(async () => {
    try {
      const { data } = await api.get('/blog-posts?populate=*');
      setArticles(data.data || []);
    } catch (err: unknown) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      const roleName = user?.role?.name?.toLowerCase() || user?.role?.type?.toLowerCase() || '';
      if (!user) {
        router.push('/login');
      } else if (!roleName.includes('manager') && !roleName.includes('admin') && !roleName.includes('content')) {
        router.push('/student');
      } else {
        fetchArticles();
      }
    }
  }, [user, authLoading, router, fetchArticles]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setPublishing(true);
    setError('');

    const payload = {
      title: title.trim(),
      content: content.trim(),
      publishedAt: isPublished ? new Date().toISOString() : null,
    };

    try {
      await api.post('/blog-posts', { data: payload });

      setTitle('');
      setContent('');
      setIsPublished(true);
      await fetchArticles();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error?.message || 'Failed to create article');
      } else {
        setError('Failed to create article');
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteArticle = async (articleId: number | string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/blog-posts/${articleId}`);
      await fetchArticles();
    } catch (err: unknown) {
      console.error('Delete error:', err);
      alert('Failed to delete article');
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2 text-indigo-600" />
            Write New Article
          </h2>

          {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>}

          <form onSubmit={handleCreateArticle} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10 Tips for Next.js 15 Full Stack Apps"
                className="w-full px-3 py-2.5 bg-white text-gray-900 font-medium border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Content</label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                className="w-full px-3 py-2.5 bg-white text-gray-900 font-medium border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-400 leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Publication State</label>
              <select
                value={isPublished ? 'published' : 'draft'}
                onChange={(e) => setIsPublished(e.target.value === 'published')}
                className="w-full px-3 py-2.5 bg-white text-gray-900 font-medium border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="published">Published (Visible on Public Blog)</option>
                <option value="draft">Draft (Unpublished)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 text-sm shadow-sm"
            >
              {publishing ? 'Saving...' : isPublished ? 'Publish Article' : 'Save as Draft'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Existing Articles ({articles.length})
          </h2>

          {articles.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
              No articles found. Write your first article on the left.
            </div>
          ) : (
            articles.map((art) => {
              const isPub = Boolean(art.publishedAt);
              return (
                <div
                  key={art.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isPub
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isPub ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" /> Published
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" /> Draft
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">{art.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {art.content || 'No content provided.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteArticle(art.documentId || art.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                    title="Delete Article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}