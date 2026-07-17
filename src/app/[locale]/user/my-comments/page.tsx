'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Reply, ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/button';

interface CommentWithArticle {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  article_id: string;
  article_title: string;
  article_slug: string;
  parent_comment?: {
    content: string;
    author_name: string;
  } | null;
}

export default function MyCommentsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [comments, setComments] = useState<CommentWithArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        router.replace('/user/login');
        return;
      }

      setUserId(userData.user.id);

      // Get user's comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, content, created_at, parent_id, article_id')
        .eq('user_id', userData.user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Get article titles
      const articleIds = Array.from(new Set(commentsData?.map(c => c.article_id) || []));
      const { data: articlesData } = await supabase
        .from('articles')
        .select('id, title, slug')
        .in('id', articleIds);

      const articleMap = new Map(articlesData?.map(a => [a.id, a]) || []);

      // Get parent comments for replies
      const parentIds = commentsData?.filter(c => c.parent_id).map(c => c.parent_id) || [];
      const { data: parentComments } = await supabase
        .from('comments')
        .select('id, content, author_name')
        .in('id', parentIds);

      const parentMap = new Map(parentComments?.map(p => [p.id, p]) || []);

      // Combine data
      const combined = commentsData?.map(comment => {
        const article = articleMap.get(comment.article_id);
        return {
          ...comment,
          article_title: article?.title || t('user.myComments.unknownArticle'),
          article_slug: article?.slug || '',
          parent_comment: comment.parent_id ? parentMap.get(comment.parent_id) : null
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
    if (!confirm(t('user.myComments.deleteConfirm'))) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;

      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(t('user.myComments.deleteFailed'));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/user/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FF6F61] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">{t('common.back')}</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-2">
            <MessageSquare size={32} className="text-[#FF6F61]" />
            <h1 className="text-3xl font-black text-gray-900">{t('user.myComments.title')}</h1>
          </div>
          <p className="text-gray-600 ml-12">
            {t('user.myComments.subtitle')}
          </p>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <MessageSquare size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('user.myComments.noComments')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                {/* Article Info */}
                <div className="flex items-start justify-between mb-4">
                  <Link
                    href={`/articles/${comment.article_slug}`}
                    className="flex items-center gap-2 text-[#FF6F61] hover:text-[#FF5A4D] font-bold group"
                  >
                    <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="line-clamp-1">{comment.article_title}</span>
                  </Link>
                  <span className="text-sm text-gray-400 flex-shrink-0 ml-4">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>

                {/* Parent Comment (if reply) */}
                {comment.parent_comment && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 border-l-4 border-[#FF6F61]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Reply size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{t('user.myComments.replyTo')} {comment.parent_comment.author_name}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{comment.parent_comment.content}</p>
                  </div>
                )}

                {/* Comment Content */}
                <div className="bg-gradient-to-r from-orange-50/50 to-pink-50/50 rounded-xl p-4 mb-3">
                  <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>{t('common.delete')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

