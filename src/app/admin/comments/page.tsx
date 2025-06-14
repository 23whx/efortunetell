"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import { getAvatarPath, getDisplayName } from '@/utils/avatar';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface Reply {
  _id: string;
  content: string;
  user?: { username: string; role?: string; avatar?: string };
  username?: string;
  createdAt: string;
  replies?: Reply[]; // 支持嵌套回复
}

interface Comment {
  _id: string;
  content: string;
  user?: { username: string; role?: string; avatar?: string };
  username?: string;
  createdAt: string;
  replies?: Reply[];
}

interface Article {
  _id: string;
  title: string;
  slug: string;
  comments: Comment[];
}

interface ArticleResponse {
  success: boolean;
  data: Article[];
  pagination: {
    current: number;
    total: number;
    count: number;
  };
}

export default function CommentManagement() {
  const { t } = useLanguage();
  const [admin, setAdmin] = useState<{ username: string; token: string } | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [tip, setTip] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      setAdmin(JSON.parse(stored));
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  // 获取所有文章及其评论
  const fetchArticlesWithComments = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      
      const response = await fetch(
        `${API_BASE_URL}/api/articles?page=${page}&limit=10&includeComments=true${searchParam}`,
        { headers }
      );
      
      const data: ArticleResponse = await response.json();
      
      if (response.ok && data.success) {
        // 只保留有评论的文章
        const articlesWithComments = data.data.filter(article => 
          article.comments && article.comments.length > 0
        );
        
        setArticles(articlesWithComments);
        setTotalPages(data.pagination.total);
        
        // 计算总评论数（包括回复）
        let total = 0;
        articlesWithComments.forEach(article => {
          total += article.comments.length;
          article.comments.forEach(comment => {
            if (comment.replies) {
              total += comment.replies.length;
              // 计算嵌套回复
              comment.replies.forEach(reply => {
                if (reply.replies) {
                  total += reply.replies.length;
                }
              });
            }
          });
        });
        setTotalComments(total);
      } else {
        setTip({ type: 'error', msg: t('admin.comments.loadFailed') });
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      setTip({ type: 'error', msg: t('admin.comments.networkError') });
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, t]);

  useEffect(() => {
    if (admin && admin.token) {
      fetchArticlesWithComments();
    }
  }, [admin, fetchArticlesWithComments]);

  useEffect(() => {
    if (tip) {
      const timer = setTimeout(() => setTip(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [tip]);

  // 删除评论
  const handleDeleteComment = async (articleId: string, commentId: string) => {
    if (!confirm(t('admin.comments.confirmDeleteComment'))) {
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/articles/${articleId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers
        }
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTip({ type: 'success', msg: t('admin.comments.deleteSuccess') });
        fetchArticlesWithComments();
      } else {
        setTip({ type: 'error', msg: data.message || t('admin.comments.deleteFailed') });
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      setTip({ type: 'error', msg: t('admin.comments.networkError') });
    }
  };

  // 删除回复
  const handleDeleteReply = async (articleId: string, commentId: string, replyId: string) => {
    if (!confirm(t('admin.comments.confirmDeleteReply'))) {
      return;
    }
    
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/articles/${articleId}/comments/${commentId}/replies/${replyId}`,
        {
          method: 'DELETE',
          headers
        }
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTip({ type: 'success', msg: t('admin.comments.deleteSuccess') });
        fetchArticlesWithComments();
      } else {
        setTip({ type: 'error', msg: data.message || t('admin.comments.deleteFailed') });
      }
    } catch (error) {
      console.error('删除回复失败:', error);
      setTip({ type: 'error', msg: t('admin.comments.networkError') });
    }
  };

  // 精准定位到评论/回复
  const handleLocate = (articleId: string, commentId: string, replyId?: string) => {
    const targetUrl = `/blog/${articleId}`;
    const anchor = replyId ? `#reply-${replyId}` : `#comment-${commentId}`;
    window.open(targetUrl + anchor, '_blank');
  };

  // 搜索
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取用户名（使用统一的显示名称函数）
  const getUsername = (item: Comment | Reply) => {
    if (item.user) {
      return getDisplayName(item.user);
    }
    return item.username || '匿名用户';
  };

  // 获取头像路径
  const getAvatarUrl = (item: Comment | Reply) => {
    if (item.user && item.user.username) {
      return getAvatarPath(item.user);
    }
    return '/user_img.png';
  };

  // 渲染回复组件
  const renderReply = (reply: Reply, articleId: string, commentId: string, level: number = 0) => {
    const maxLevel = 2; // 最大显示层级
    const bgColor = level === 0 ? 'bg-blue-50' : 'bg-purple-50';
    const borderColor = level === 0 ? 'border-blue-200' : 'border-purple-200';
    
    return (
      <div key={reply._id} className={`ml-${level * 4} border-l-2 ${borderColor} pl-3 mt-2`}>
        <div className={`${bgColor} rounded p-3 border ${borderColor}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden">
                <Image
                  src={getAvatarUrl(reply)}
                  alt="用户头像"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              </div>
              <span className="font-medium text-blue-600 text-sm">
                {getUsername(reply)}
              </span>
              <span className="text-gray-500 text-xs">
                {formatDate(reply.createdAt)}
              </span>
              <span className="text-xs text-gray-400">
                {level === 0 ? t('blog.reply') : t('admin.comments.nestedReply')}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => handleLocate(articleId, commentId, reply._id)}
              >
                {t('admin.comments.locate')}
              </Button>
              <Button
                className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleDeleteReply(articleId, commentId, reply._id)}
              >
                {t('admin.comments.delete')}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
          
          {/* 显示嵌套回复 */}
          {reply.replies && reply.replies.length > 0 && level < maxLevel && (
            <div className="mt-2">
              {reply.replies.map(nestedReply => 
                renderReply(nestedReply, articleId, commentId, level + 1)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
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

      <AdminSidebar activeItem="comments" />
      
      <main className="flex-1 flex flex-col items-center py-12 px-4 transition-all duration-300 md:ml-56">
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8">
          <h2 className="text-2xl font-bold text-[#FF6F61] mb-6 text-center">{t('admin.comments.title')}</h2>
          
          {/* 搜索栏 */}
          <div className="mb-6 flex gap-2 items-center">
            <input 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('admin.comments.search')} 
              className="border border-[#FF6F61] rounded px-3 py-2 flex-1" 
            />
            <Button 
              className="bg-[#FF6F61] text-white px-6 py-2" 
              onClick={handleSearch}
            >
              {t('admin.comments.searchButton')}
            </Button>
          </div>

          {/* 统计信息 */}
          <div className="mb-6 bg-gray-50 rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#FF6F61]">{articles.length}</div>
                <div className="text-sm text-gray-600">{t('admin.comments.articlesWithComments')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalComments}</div>
                <div className="text-sm text-gray-600">{t('admin.comments.totalComments')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{totalPages}</div>
                <div className="text-sm text-gray-600">{t('admin.comments.totalPages')}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {articles.length > 0 ? (
                <div className="space-y-8">
                  {articles.map(article => (
                    <div key={article._id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      {/* 文章标题 */}
                      <div className="mb-4 pb-4 border-b border-gray-300">
                        <h3 className="text-lg font-bold text-[#FF6F61] mb-2">
                          {article.title}
                        </h3>
                        <Button
                          className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-1"
                          onClick={() => window.open(`/blog/${article._id}`, '_blank')}
                        >
                          {t('admin.comments.viewArticle')}
                        </Button>
                      </div>

                      {/* 评论列表 */}
                      <div className="space-y-4">
                        {article.comments.map(comment => (
                          <div key={comment._id} className="bg-white rounded-lg p-4 border border-gray-200">
                            {/* 主评论 */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                                  <Image
                                    src={getAvatarUrl(comment)}
                                    alt="用户头像"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                    unoptimized={true}
                                  />
                                </div>
                                <span className="font-medium text-[#FF6F61]">
                                  {getUsername(comment)}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  {formatDate(comment.createdAt)}
                                </span>
                                <span className="text-xs bg-[#FF6F61] text-white px-2 py-1 rounded">
                                  {t('blog.comment')}
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                                  onClick={() => handleLocate(article._id, comment._id)}
                                >
                                  {t('admin.comments.locate')}
                                </Button>
                                <Button
                                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => handleDeleteComment(article._id, comment._id)}
                                >
                                  {t('admin.comments.delete')}
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{comment.content}</p>

                            {/* 回复列表 */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="border-t border-gray-100 pt-3">
                                <div className="text-sm text-gray-600 mb-2">
                                  {comment.replies.length} {t('admin.comments.repliesCount')}
                                </div>
                                {comment.replies.map(reply => 
                                  renderReply(reply, article._id, comment._id, 0)
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? t('common.searchNoResults') : t('admin.comments.noComments')}
                </div>
              )}

              {/* 分页器 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button 
                    className="px-4 py-2" 
                    disabled={page === 1} 
                    onClick={() => setPage(p => Math.max(1, p-1))}
                  >
                    {t('common.previous')}
                  </Button>
                  <span className="text-[#FF6F61] font-medium">
                    {t('common.page')} {page} / {t('common.total')} {totalPages}
                  </span>
                  <Button 
                    className="px-4 py-2" 
                    disabled={page === totalPages || totalPages === 0} 
                    onClick={() => setPage(p => Math.min(totalPages, p+1))}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 