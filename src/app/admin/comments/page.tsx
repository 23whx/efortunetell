'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Trash2, ExternalLink, Search } from 'lucide-react';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminSidebar from '@/components/shared/AdminSidebar';

interface CommentWithDetails {
  id: string;
  content: string;
  author_name: string;
  user_id: string | null;
  created_at: string;
  article_id: string;
  article_title: string;
  article_slug: string;
  parent_id: string | null;
  status: string;
}

export default function AdminCommentsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    checkAdminAndLoadComments();
  }, [statusFilter]);

  const checkAdminAndLoadComments = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/user/login');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.replace('/');
        return;
      }

      loadComments();
    } catch (err) {
      console.error('Failed to check admin status:', err);
      router.replace('/');
    }
  };

  const loadComments = async () => {
    try {
      const supabase = createSupabaseBrowserClient();

      let query = supabase
        .from('comments')
        .select('id, content, author_name, user_id, created_at, article_id, parent_id, status')
        .order('created_at', { ascending: false })
        .limit(200);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: commentsData, error: commentsError } = await query;

      if (commentsError) throw commentsError;

      // Get article titles
      const articleIds = Array.from(new Set(commentsData?.map(c => c.article_id) || []));
      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, title, slug')
        .in('id', articleIds);

      const articleMap = new Map(articlesData?.map(a => [a.id, a]) || []);

      // Combine data
      const combined = commentsData?.map(comment => {
        const article = articleMap.get(comment.article_id);
        return {
          ...comment,
          article_title: article?.title || t('user.myComments.unknownArticle'),
          article_slug: article?.slug || ''
        };
      }) || [];

      setComments(combined);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(t('admin.comments.deleteConfirm'))) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(t('admin.comments.deleteFailed'));
    }
  };

  const handleUpdateStatus = async (commentId: string, newStatus: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('comments')
        .update({ status: newStatus })
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.map(c => 
        c.id === commentId ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(t('admin.comments.updateFailed'));
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return t('comment.justNow');
    if (seconds < 3600) return t('comment.minutesAgo').replace('{n}', Math.floor(seconds / 60).toString());
    if (seconds < 86400) return t('comment.hoursAgo').replace('{n}', Math.floor(seconds / 3600).toString());
    return t('comment.daysAgo').replace('{n}', Math.floor(seconds / 86400).toString());
  };

  const filteredComments = comments.filter(comment => 
    searchTerm === '' || 
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.article_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeItem="comments" />
      <div className="md:ml-64 py-8 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <MessageSquare size={32} className="text-[#FF6F61]" />
            <div>
              <h1 className="text-3xl font-black text-gray-900">{t('admin.comments.title')}</h1>
              <p className="text-gray-600">{t('admin.comments.subtitle')}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder={t('admin.comments.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6F61]"
            >
              <option value="all">{t('admin.comments.allStatus')}</option>
              <option value="approved">{t('admin.comments.approved')}</option>
              <option value="pending">{t('admin.comments.pending')}</option>
              <option value="rejected">{t('admin.comments.rejected')}</option>
            </select>
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-gray-600">
            {t('admin.comments.total')}: <strong>{filteredComments.length}</strong>
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : filteredComments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MessageSquare size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('admin.comments.noComments')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{comment.author_name}</span>
                      <span className="text-sm text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                      {comment.parent_id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {t('user.myComments.replyTo')}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        comment.status === 'approved' ? 'bg-green-100 text-green-700' :
                        comment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {comment.status}
                      </span>
                    </div>
                    <Link
                      href={`/articles/${comment.article_slug}`}
                      className="flex items-center gap-2 text-sm text-[#FF6F61] hover:text-[#FF5A4D] group"
                      target="_blank"
                    >
                      <ExternalLink size={14} />
                      <span className="line-clamp-1">{comment.article_title}</span>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {comment.status !== 'approved' && (
                    <Button
                      onClick={() => handleUpdateStatus(comment.id, 'approved')}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1"
                      size="sm"
                    >
                      {t('admin.comments.approve')}
                    </Button>
                  )}
                  {comment.status !== 'rejected' && (
                    <Button
                      onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1"
                      size="sm"
                    >
                      {t('admin.comments.reject')}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(comment.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1"
                    size="sm"
                  >
                    <Trash2 size={14} className="mr-1" />
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
