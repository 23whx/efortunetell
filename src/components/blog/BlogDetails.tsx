'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Article } from '@/app/blog/[id]/page';
import Image from 'next/image';
import { API_BASE_URL, getImageUrl, getAuthHeaders } from '@/config/api';
import { Heart, Bookmark, MessageCircle, Eye, Calendar, Share2, ArrowUp } from 'lucide-react';
import { getAvatarPath, getDisplayName } from '@/utils/avatar';
import { formatDate } from '@/utils/date';
import { useLanguage } from '@/contexts/LanguageContext';
import ShareModal from '@/components/ui/ShareModal';

interface BlogDetailsProps {
  article: Article;
}

export default function BlogDetails({ article }: BlogDetailsProps) {
  console.log('🔧 [BlogDetails] 组件接收到的文章数据:', {
    title: article.title,
    contentLength: article.content?.length,
    coverImage: article.coverImage,
    contentPreview: article.content?.substring(0, 200)
  });
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const [comment, setComment] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToReplyId, setReplyToReplyId] = useState<string | null>(null); // 新增：记录要回复的回复ID
  const [replyContent, setReplyContent] = useState('');
  const [tip, setTip] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likes || 0);
  const [bookmarksCount, setBookmarksCount] = useState(article.bookmarks || 0);
  const [showShareModal, setShowShareModal] = useState(false);

  // 监听article属性变化，更新状态
  useEffect(() => {
    console.log('🔧 [BlogDetails] article属性变化，更新统计数据');
    console.log('🔧 [BlogDetails] 新的likes:', article.likes);
    console.log('🔧 [BlogDetails] 新的bookmarks:', article.bookmarks);
    setLikesCount(article.likes || 0);
    setBookmarksCount(article.bookmarks || 0);
  }, [article.likes, article.bookmarks]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const router = useRouter();
  const [processedContent, setProcessedContent] = useState<string>('');

  // 处理文章内容中的图片URL
  useEffect(() => {
    console.log('🔧 [BlogDetails] useEffect - 开始处理文章内容');
    console.log('🔧 [BlogDetails] 原始文章内容:', article.content);
    console.log('🔧 [BlogDetails] 内容长度:', article.content?.length);
    
    if (article.content) {
      // 先检查原始内容中的所有图片
      const originalImages = article.content.match(/<img[^>]*>/g) || [];
      console.log('🔧 [BlogDetails] 原始内容中的图片标签:', originalImages);
      
      // 替换所有相对路径图片为后端完整URL，并添加错误处理
      const processedHtml = article.content.replace(
        /<img\s+([^>]*\s+)?src=["']([^"']+)["']([^>]*)?>/g, 
        (match, before = '', src, after = '') => {
          console.log('🔧 [BlogDetails] 处理图片标签:', { match, src, before, after });
          
          // 如果已经是完整URL，不处理
          if (src.startsWith('http://') || src.startsWith('https://')) {
            console.log('🔧 [BlogDetails] 跳过完整URL:', src);
            return match;
          }
          
          const fullUrl = getImageUrl(src);
          console.log('🔧 [BlogDetails] 图片URL转换:', src, '->', fullUrl);
          
          // Ensure every image has an English alt attribute for better accessibility & SEO
          const hasAlt = /alt=/i.test(before + after);
          const altAttr = hasAlt ? '' : ` alt="${article.title}"`;
          
          // Add lazy-loading, basic styles and graceful-error handling
          return `<img ${before}src="${fullUrl}"${after}${altAttr} style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" loading="lazy" onerror="this.onerror=null; this.style.display='none'; console.error('Image failed to load:', this.src);">`;
        }
      );
      
      console.log('🔧 [BlogDetails] 处理后的HTML:', processedHtml);
      console.log('🔧 [BlogDetails] 处理后HTML长度:', processedHtml.length);
      
      // 检查处理后的内容中的图片
      const processedImages = processedHtml.match(/<img[^>]*>/g) || [];
      console.log('🔧 [BlogDetails] 处理后的图片标签:', processedImages);
      
      setProcessedContent(processedHtml);
    } else {
      console.log('🔧 [BlogDetails] 没有文章内容，使用空字符串');
      setProcessedContent(article.content || '');
    }
  }, [article.content]);

  // 监听滚动，显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 获取用户信息和点赞/收藏状态
  useEffect(() => {
    const u = localStorage.getItem('user');
    const a = localStorage.getItem('admin');
    setUser(u ? JSON.parse(u) : null);
    setAdmin(a ? JSON.parse(a) : null);

    // 获取用户的点赞和收藏状态
    const fetchUserLikeStatus = async () => {
      try {
        const headers = getAuthHeaders();
        if (!headers || (!u && !a)) return;

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.data && userData.data.user) {
            const userProfile = userData.data.user;
            setIsLiked(userProfile.likedArticles?.includes(article._id) || false);
            setIsBookmarked(userProfile.bookmarkedArticles?.includes(article._id) || false);
          }
        }
      } catch (error) {
        console.error('获取用户状态失败:', error);
      }
    };

    fetchUserLikeStatus();
  }, [article._id]);

  // 提示信息计时器
  useEffect(() => {
    if (tip) {
      const timer = setTimeout(() => setTip(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [tip]);

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    router.push(`/?tag=${encodeURIComponent(tag)}`);
  };

  // 点赞文章
  const handleLike = async () => {
    if (!user && !admin) {
      setTip({ type: 'error', msg: t('blog.loginRequired') });
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/articles/${article._id}/like`, {
        method: 'PUT',
        headers
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsLiked(data.liked);
        setLikesCount(data.likes);
        setTip({ type: 'success', msg: data.liked ? t('blog.likeSuccess') : t('blog.unlikeSuccess') });
      } else {
        setTip({ type: 'error', msg: data.message || t('blog.operationFailed') });
      }
    } catch (error) {
      console.error('点赞失败:', error);
      setTip({ type: 'error', msg: t('blog.networkError') });
    }
  };
  
  // 收藏文章
  const handleBookmark = async () => {
    if (!user && !admin) {
      setTip({ type: 'error', msg: t('blog.loginRequiredBookmark') });
      return;
    }

    try {
      const headers = getAuthHeaders();
      console.log('🔖 收藏操作 - 认证头部:', headers);
      console.log('🔖 收藏操作 - 用户状态:', { user, admin });
      console.log('🔖 收藏操作 - localStorage token:', localStorage.getItem('token'));
      console.log('🔖 收藏操作 - localStorage user:', localStorage.getItem('user'));
      
      const response = await fetch(`${API_BASE_URL}/api/articles/${article._id}/bookmark`, {
        method: 'PUT',
        headers
      });

      const data = await response.json();
      console.log('🔖 收藏操作 - 服务器响应:', { status: response.status, data });
      
      if (response.ok && data.success) {
        setIsBookmarked(data.bookmarked);
        setBookmarksCount(data.bookmarks);
        setTip({ type: 'success', msg: data.bookmarked ? t('blog.bookmarkSuccess') : t('blog.unbookmarkSuccess') });
      } else {
        console.error('🔖 收藏操作失败:', data);
        if (response.status === 401) {
          setTip({ type: 'error', msg: '请先登录后再收藏文章' });
        } else {
          setTip({ type: 'error', msg: data.message || t('blog.operationFailed') });
        }
      }
    } catch (error) {
      console.error('收藏失败:', error);
      setTip({ type: 'error', msg: t('blog.networkError') });
    }
  };

  // 分享文章
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  // 提交评论
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setTip({ type: 'error', msg: t('blog.commentEmpty') });
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/articles/${article._id}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: comment.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTip({ type: 'success', msg: t('blog.commentSuccess') });
        setComment('');
        // 重新加载页面以显示新评论
        window.location.reload();
      } else {
        setTip({ type: 'error', msg: data.message || t('blog.operationFailed') });
      }
    } catch (error) {
      console.error('评论发布错误:', error);
      setTip({ type: 'error', msg: t('blog.networkError') });
    }
  };

  // 提交回复
  const handleReply = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      setTip({ type: 'error', msg: t('blog.replyEmpty') });
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      let apiUrl = `${API_BASE_URL}/api/articles/${article._id}/comments/${commentId}/replies`;
      
      // 如果是回复的回复，使用不同的API端点
      if (replyToReplyId) {
        apiUrl = `${API_BASE_URL}/api/articles/${article._id}/comments/${commentId}/replies/${replyToReplyId}/replies`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: replyContent.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTip({ type: 'success', msg: t('blog.replySuccess') });
        setReplyContent('');
        setReplyToCommentId(null);
        setReplyToReplyId(null);
        // 重新加载页面以显示新回复
        window.location.reload();
      } else {
        setTip({ type: 'error', msg: data.message || t('blog.operationFailed') });
      }
    } catch (error) {
      console.error('回复发布错误:', error);
      setTip({ type: 'error', msg: t('blog.networkError') });
    }
  };

  // 点击回复按钮（回复评论）
  const handleReplyClick = (commentId: string) => {
    setReplyToCommentId(commentId);
    setReplyToReplyId(null);
    setReplyContent('');
  };

  // 点击回复按钮（回复的回复）
  const handleNestedReplyClick = (commentId: string, replyId: string) => {
    setReplyToCommentId(commentId);
    setReplyToReplyId(replyId);
    setReplyContent('');
  };

  // 取消回复
  const handleCancelReply = () => {
    setReplyToCommentId(null);
    setReplyToReplyId(null);
    setReplyContent('');
  };
  
  const canComment = !!user || !!admin;

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 获取封面图片URL
  const getCoverImageUrl = () => {
    console.log('🔧 [BlogDetails] 获取封面图片:', {
      hasCoverImage: !!article.coverImage,
      coverImage: article.coverImage,
      isDefault: article.coverImage === 'default-cover.jpg'
    });
    
    if (!article.coverImage || article.coverImage === 'default-cover.jpg') {
      console.log('🔧 [BlogDetails] 没有封面图片或使用默认图片，返回null');
      return null;
    }
    
    const coverUrl = getImageUrl(article.coverImage);
    console.log('🔧 [BlogDetails] 封面图片URL转换:', article.coverImage, '->', coverUrl);
    return coverUrl;
  };

  const coverImageUrl = getCoverImageUrl();
  console.log('🔧 [BlogDetails] 最终封面图片URL:', coverImageUrl);

  // 获取用户头像和显示名称的辅助函数
  const getUserAvatar = (user?: { _id: string; username: string; avatar?: string; role?: string }) => {
    if (!user) return '/user_img.png';
    return getAvatarPath(user);
  };

  const getUserDisplayName = (user?: { _id: string; username: string; avatar?: string; role?: string }) => {
    if (!user) return '匿名用户';
    return getDisplayName(user);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffacd' }}>
      {/* 提示信息 */}
      {tip && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-white font-medium ${
            tip.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {tip.msg}
          </div>
        </div>
      )}

      {/* 主体内容 */}
      <div className="max-w-4xl mx-auto bg-white shadow-sm">
        {/* 封面图片 */}
        {coverImageUrl && (
          <div className="w-full h-80 relative overflow-hidden">
            {article.coverSettings ? (
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${coverImageUrl})`,
                  backgroundSize: `${article.coverSettings.scale * 100}%`,
                  backgroundPosition: `${article.coverSettings.positionX}% ${article.coverSettings.positionY}%`,
                  backgroundRepeat: 'no-repeat'
                }}
              />
            ) : (
              <Image
                src={coverImageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
                unoptimized={true}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/default-image.svg';
                  target.alt = '封面图片加载失败';
                }}
              />
            )}
            {/* 渐变蒙版 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        {/* 文章内容区域 */}
        <div className="px-8 py-8">
          {/* 文章头部信息 */}
          <div className="mb-8">
            {/* 分类标签 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#fff5f4', color: '#ff6f61' }}>
                {article.category}
              </span>
              {article.tags && article.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* 文章标题 */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* 文章摘要 */}
            {article.summary && (
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {article.summary}
              </p>
            )}

            {/* 作者和发布信息 */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                    <Image
                      src={getUserAvatar(article.author)}
                      alt="Author avatar"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {getUserDisplayName(article.author)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">
                    {formatDate(article.publishedAt || article.createdAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">{article.views || 0} 阅读</span>
                </div>
              </div>

              {/* 保留空的div以维持布局 */}
              <div></div>
            </div>
          </div>

          {/* 文章正文 */}
          <div className="prose prose-lg max-w-none mb-12">
            <style jsx>{`
              .article-content {
                color: #374151;
                line-height: 1.8;
                font-size: 16px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              }
              
              .article-content h1,
              .article-content h2,
              .article-content h3,
              .article-content h4,
              .article-content h5,
              .article-content h6 {
                color: #111827;
                font-weight: 600;
                margin: 1.5em 0 0.5em 0;
                line-height: 1.4;
              }
              
              .article-content h1 { font-size: 2em; }
              .article-content h2 { font-size: 1.75em; }
              .article-content h3 { font-size: 1.5em; }
              .article-content h4 { font-size: 1.25em; }
              
              .article-content p {
                margin: 1em 0;
                color: #374151;
              }
              
              .article-content img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 20px 0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                display: block;
              }
              
              .article-content blockquote {
                border-left: 4px solid #e5e7eb;
                padding-left: 1rem;
                margin: 1.5rem 0;
                color: #6b7280;
                font-style: italic;
                background: #f9fafb;
                padding: 1rem 1rem 1rem 2rem;
                border-radius: 0 4px 4px 0;
              }
              
              .article-content ul,
              .article-content ol {
                margin: 1em 0;
                padding-left: 1.5em;
              }
              
              .article-content li {
                margin: 0.5em 0;
                color: #374151;
              }
              
              .article-content code {
                background: #f3f4f6;
                padding: 0.2em 0.4em;
                border-radius: 4px;
                font-size: 0.9em;
                color: #e11d48;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              }
              
              .article-content pre {
                background: #1f2937;
                color: #f9fafb;
                padding: 1rem;
                border-radius: 8px;
                overflow-x: auto;
                margin: 1.5rem 0;
              }
              
              .article-content pre code {
                background: none;
                color: inherit;
                padding: 0;
              }
              
              .article-content a {
                color: #3b82f6;
                text-decoration: none;
                border-bottom: 1px solid transparent;
                transition: border-color 0.2s;
              }
              
              .article-content a:hover {
                border-bottom-color: #3b82f6;
              }
              
              .article-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
                font-size: 0.9em;
              }
              
              .article-content th,
              .article-content td {
                border: 1px solid #e5e7eb;
                padding: 0.75rem;
                text-align: left;
              }
              
              .article-content th {
                background: #f9fafb;
                font-weight: 600;
                color: #374151;
              }
              
              .article-content hr {
                border: none;
                height: 1px;
                background: #e5e7eb;
                margin: 2rem 0;
              }
            `}</style>
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </div>

          {/* 文章底部信息 */}
          <div className="border-t border-gray-100 pt-8">
            {/* 再次显示互动按钮 */}
            <div className="flex items-center justify-center space-x-6 mb-8">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-colors ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{t('blog.like')} {likesCount}</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-colors ${
                  isBookmarked 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{t('blog.bookmark')} {bookmarksCount}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-6 py-3 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>分享</span>
              </button>
            </div>

            {/* 评论区 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {t('blog.comments')} ({article.commentsCount || 0})
                </h3>
              </div>

              {/* 评论输入 */}
              {canComment ? (
                <form onSubmit={handleComment} className="mb-8">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={`${t('blog.comment')}...`}
                      className="w-full p-4 border-0 resize-none focus:outline-none"
                      rows={4}
                    />
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                      <Button
                        type="submit"
                        className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#ff6f61' }}
                      >
{t('blog.publish')} {t('blog.comment')}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('blog.loginRequiredComment')}</p>
                </div>
              )}

              {/* 评论列表 */}
              {article.comments && article.comments.length > 0 ? (
                <div className="space-y-6">
                  {article.comments.map((comment, idx) => (
                    <div key={comment._id || idx} id={`comment-${comment._id}`} className="bg-white rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                          <Image
                            src={getUserAvatar(comment.user)}
                            alt="User avatar"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized={true}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">
                              {getUserDisplayName(comment.user)}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {formatDate(comment.createdAt || comment.date || new Date().toISOString())}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-3">
                            {comment.content}
                          </p>
                          
                          {/* 回复按钮 */}
                          {canComment && (
                            <button 
                              onClick={() => handleReplyClick(comment._id)}
                              className="text-sm font-medium hover:opacity-80 transition-opacity mb-3" 
                              style={{ color: '#ff6f61' }}
                            >
                              {t('blog.reply')}
                            </button>
                          )}

                          {/* 显示回复列表 */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
                              {comment.replies.map((reply, replyIdx) => (
                                <div key={reply._id || replyIdx} id={`reply-${reply._id}`} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden">
                                      <Image
                                        src={getUserAvatar(reply.user)}
                                        alt="User avatar"
                                        width={24}
                                        height={24}
                                        className="w-full h-full object-cover"
                                        unoptimized={true}
                                      />
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">
                                      {getUserDisplayName(reply.user)}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {formatDate(reply.createdAt || reply.date || new Date().toISOString())}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                                    {reply.content}
                                  </p>
                                  
                                  {/* 回复按钮 */}
                                  {canComment && (
                                    <button 
                                      onClick={() => handleNestedReplyClick(comment._id, reply._id || `${replyIdx}`)}
                                      className="text-xs font-medium hover:opacity-80 transition-opacity" 
                                      style={{ color: '#ff6f61' }}
                                    >
                                      回复
                                    </button>
                                  )}

                                  {/* 显示回复的回复 */}
                                  {reply.replies && reply.replies.length > 0 && (
                                    <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
                                      {reply.replies.map((nestedReply, nestedIdx) => (
                                        <div key={nestedReply._id || nestedIdx} id={`reply-${nestedReply._id}`} className="bg-white rounded-lg p-2">
                                          <div className="flex items-center space-x-2 mb-1">
                                            <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden">
                                              <Image
                                                src={getUserAvatar(nestedReply.user)}
                                                alt="User avatar"
                                                width={20}
                                                height={20}
                                                className="w-full h-full object-cover"
                                                unoptimized={true}
                                              />
                                            </div>
                                            <span className="font-medium text-gray-900 text-xs">
                                              {getUserDisplayName(nestedReply.user)}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                              {formatDate(nestedReply.createdAt || nestedReply.date || new Date().toISOString())}
                                            </span>
                                          </div>
                                          <p className="text-gray-700 text-xs leading-relaxed mb-1">
                                            {nestedReply.content}
                                          </p>
                                          
                                          {/* 嵌套回复的回复按钮 */}
                                          {canComment && (
                                            <button 
                                              onClick={() => handleNestedReplyClick(comment._id, reply._id || `${replyIdx}`)}
                                              className="text-xs font-medium hover:opacity-80 transition-opacity" 
                                              style={{ color: '#ff6f61' }}
                                            >
                                              回复
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 回复输入框 */}
                          {replyToCommentId === comment._id && (
                            <div className="mt-4">
                              <form onSubmit={(e) => handleReply(e, comment._id)} className="space-y-3">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder={`${t('blog.reply')} ${getUserDisplayName(comment.user)}...`}
                                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6f61] focus:border-transparent"
                                  rows={3}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    type="button"
                                    onClick={handleCancelReply}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                    style={{ color: '#ff6f61' }}
                                  >
{t('blog.cancel')}
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: '#ff6f61' }}
                                  >
                                    {t('blog.publish')} {t('blog.reply')}
                                  </Button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无评论，快来抢沙发吧！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 回到顶部按钮 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity z-40"
          style={{ backgroundColor: '#ff6f61' }}
        >
          <ArrowUp className="w-6 h-6 mx-auto" />
        </button>
      )}

      {/* 分享模态框 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={article.title}
        summary={article.summary}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        coverImage={getCoverImageUrl() || undefined}
      />
    </div>
  );
} 