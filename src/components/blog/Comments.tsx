'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, Reply, Trash2, Send, LogIn } from 'lucide-react';
import Button from '../ui/button';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  article_id: string;
  user_id: string | null;
  author_name: string;
  author_email: string | null;
  content: string;
  parent_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId }: CommentsProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    loadComments();
    checkUser();
  }, [articleId]);

  const checkUser = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setCurrentUserId(data.user.id);
      // Load user's display name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.display_name) {
        setAuthorName(profile.display_name);
      }
    }
  };

  const loadComments = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Build comment tree
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      data?.forEach((comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      data?.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(commentMap.get(comment.id)!);
          }
        } else {
          rootComments.push(commentMap.get(comment.id)!);
        }
      });

      setComments(rootComments);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateContent = (text: string): boolean => {
    const length = text.trim().length;
    if (length < 6) {
      setError(t('comment.minLength'));
      return false;
    }
    if (length > 66) {
      setError(t('comment.maxLength'));
      return false;
    }
    return true;
  };

  const checkRateLimit = async (): Promise<boolean> => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.rpc('check_comment_rate_limit', {
        p_ip_address: '0.0.0.0', // Will be replaced by actual IP in production
        p_user_id: currentUserId
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to not block users
      }

      return data === true;
    } catch (err) {
      console.error('Rate limit check failed:', err);
      return true;
    }
  };

  const handleCommentClick = () => {
    if (!currentUserId) {
      setShowLoginPrompt(true);
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if user is logged in
    if (!currentUserId) {
      setShowLoginPrompt(true);
      return;
    }

    if (!validateContent(content)) {
      return;
    }

    // Check rate limit
    const canComment = await checkRateLimit();
    if (!canComment) {
      setError(t('comment.rateLimitExceeded'));
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const commentData = {
        article_id: articleId,
        user_id: currentUserId,
        author_name: authorName,
        author_email: null,
        content: content.trim(),
        parent_id: replyingTo,
        status: 'approved',
        ip_address: '0.0.0.0', // Will be replaced by server-side function
        user_agent: navigator.userAgent
      };

      const { error: insertError } = await supabase
        .from('comments')
        .insert(commentData);

      if (insertError) throw insertError;

      // Reset form
      setContent('');
      setReplyingTo(null);
      
      // Reload comments
      await loadComments();
      
      // Show success message briefly
      setError(t('comment.submitSuccess'));
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setError(t('comment.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(t('comment.deleteConfirm'))) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await loadComments();
      setError(t('comment.deleteSuccess'));
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError(t('comment.deleteFailed'));
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

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <div className={`${depth > 0 ? 'ml-8 md:ml-16 mt-4' : 'mt-6'}`}>
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="font-bold text-gray-900">{comment.author_name}</span>
            <span className="text-sm text-gray-400 ml-3">{formatTimeAgo(comment.created_at)}</span>
          </div>
          {currentUserId === comment.user_id && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-4">{comment.content}</p>
        
        {depth < 2 && (
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="flex items-center gap-2 text-sm text-[#FF6F61] hover:text-[#FF5A4D] transition-colors font-medium"
          >
            <Reply size={14} />
            {t('comment.reply')}
          </button>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Reply form */}
      {replyingTo === comment.id && (
        <div className="mt-4 ml-8 md:ml-16">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {t('comment.replyPlaceholder').replace('{name}', comment.author_name)}
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                {t('comment.cancel')}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#FF6F61] focus:outline-none resize-none"
              rows={3}
              placeholder={t('comment.placeholder')}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400">
                {content.length}/66
              </span>
              <Button
                onClick={handleSubmit}
                disabled={submitting || content.trim().length < 6}
                className="bg-[#FF6F61] hover:bg-[#FF5A4D]"
                size="sm"
              >
                {submitting ? t('comment.submitting') : t('comment.submit')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#FF6F61]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn size={32} className="text-[#FF6F61]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                {t('comment.loginToComment')}
              </h3>
              <p className="text-gray-600">
                {t('comment.loginPromptMessage')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowLoginPrompt(false)}
                variant="outline"
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => router.push('/user/login')}
                className="flex-1 bg-[#FF6F61] hover:bg-[#FF5A4D]"
              >
                {t('common.login')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare size={24} className="text-[#FF6F61]" />
        <h2 className="text-2xl font-black text-gray-900">
          {t('comment.title')} ({comments.length})
        </h2>
      </div>

      {/* Comment form */}
      {!replyingTo && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 mb-8">
          {currentUserId ? (
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#FF6F61] focus:outline-none resize-none"
                rows={4}
                placeholder={t('comment.placeholder')}
              />
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-400">
                  {content.length}/66 {content.length < 6 && `(${t('comment.minLength')})`}
                </span>
                <Button
                  type="submit"
                  disabled={submitting || content.trim().length < 6}
                  className="bg-[#FF6F61] hover:bg-[#FF5A4D] flex items-center gap-2"
                >
                  <Send size={16} />
                  {submitting ? t('comment.submitting') : t('comment.submit')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">{t('comment.loginToComment')}</p>
              <Button
                onClick={() => setShowLoginPrompt(true)}
                className="bg-[#FF6F61] hover:bg-[#FF5A4D] flex items-center gap-2 mx-auto"
              >
                <LogIn size={16} />
                {t('common.login')}
              </Button>
            </div>
          )}
          
          {error && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${
              error.includes('成功') || error.includes('success') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{t('comment.noComments')}</div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

