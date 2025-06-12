"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { getAuthHeaders, fetchWithAuth, API_BASE_URL, getImageUrl } from '@/config/api';

// 定义文章类型接口
interface Article {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  likes: number;
  views: number;
  bookmarks: number;
  comments: any[];
  createdAt: string;
  publishedAt: string;
  author: any;
  coverImage?: string; // 可选
  cover?: string; // 向下兼容
}

export default function ArticleManagement() {
  // 状态管理
  const [admin, setAdmin] = useState<{ username: string, token: string } | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'title' | 'full'>('full');
  // 分页相关
  const [articlePage, setArticlePage] = useState(1);
  const router = useRouter();

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/articles`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`获取文章失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // 将API返回的cover字段适配为coverImage字段，并处理绝对路径
        const adaptedArticles = data.data.map((article: any) => {
          // 处理图片路径，将本地绝对路径转换为相对URL
          let coverImagePath = article.coverImage || article.cover || null;
          
          // 过滤掉已知的无效图片路径
          if (coverImagePath && (
            coverImagePath === 'http://26.26.26.1:3000/default-cover.jpg' ||
            coverImagePath === 'default-cover.jpg' ||
            coverImagePath === '/default-cover.jpg'
          )) {
            coverImagePath = null;
          }
          
          // 如果是本地绝对路径，提取文件名部分并转换为相对URL
          if (coverImagePath) {
            // 检测到blob URL，这是一个无效的URL，应设为null
            // blob URL是临时的，不能持久化存储
            if (coverImagePath.startsWith('blob:')) {
              console.warn('检测到无效的blob URL，跳过显示:', coverImagePath);
              coverImagePath = null;
            }
            // 处理UUID格式的文件名
            else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z]+$/i.test(coverImagePath)) {
              coverImagePath = `/images/${coverImagePath}`;
            }
            // 处理同一API服务器上的完整URL路径
            else if (coverImagePath.startsWith('http://26.26.26.1:3000/') || 
                     coverImagePath.includes(':5000/images/')) {
              // 从API服务器URL中提取文件名，添加/images/前缀
              const fileName = coverImagePath.split('/').pop();
              coverImagePath = `/images/${fileName}`;
            }
            // 处理Windows风格路径 (反斜杠)
            else if (coverImagePath.includes('\\images\\')) {
              const fileName = coverImagePath.split('\\').pop();
              coverImagePath = `/images/${fileName}`;
            }
            // 处理Unix风格的绝对路径 (但排除新格式的相对路径)
            else if (coverImagePath.includes('/images/') && 
                     (coverImagePath.startsWith('D:') || coverImagePath.startsWith('C:')) &&
                     !coverImagePath.startsWith('/images/articles/')) {
              const fileName = coverImagePath.split('/').pop();
              coverImagePath = `/images/${fileName}`;
            }
            // 新格式和旧格式的相对路径 - 直接使用，不再简化
            else if (coverImagePath.startsWith('/images/')) {
              // 新格式：/images/articles/{articleId}/filename.jpg
              // 旧格式：/images/filename.jpg
              // 都直接使用，不做任何处理
            }
            // 处理只包含文件名或者非/images/开头的路径的情况
            else if (!coverImagePath.startsWith('/images/') && 
                     !coverImagePath.startsWith('http://') && 
                     !coverImagePath.startsWith('https://')) {
              // 如果只是文件名，添加/images/前缀
              const fileName = coverImagePath.split('/').pop() || coverImagePath;
              coverImagePath = `/images/${fileName}`;
            }
          }
          
          console.log(`文章 "${article.title}" 的封面图片路径:`, coverImagePath);
          
          return {
            ...article,
            coverImage: coverImagePath
          };
        });
        setArticles(adaptedArticles);
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.error('获取文章错误:', err);
      setError(err instanceof Error ? err.message : '获取文章失败');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      const adminData = JSON.parse(stored);
      setAdmin(adminData);
    } else {
      router.replace('/admin/login');
    }
  }, [router]);
  
  // 当admin存在时获取文章
  useEffect(() => {
    if (admin && admin.token) {
      fetchArticles();
    }
  }, [admin]);

  // 页面离开时清理临时图片
  useEffect(() => {
    const cleanupTempImages = async () => {
      try {
        const cleanupResponse = await fetch('/api/temp-cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const cleanupResult = await cleanupResponse.json();
        if (cleanupResult.success && cleanupResult.deletedCount > 0) {
          console.log('🧹 页面离开时清理临时图片:', cleanupResult.message);
        }
      } catch (error) {
        console.warn('⚠️ 页面离开时清理临时图片失败:', error);
      }
    };

    // 页面卸载时执行清理
    return () => {
      cleanupTempImages();
    };
  }, []);

  // 文章过滤和分页
  const filteredArticles = articles.filter(a => {
    if (!articleSearch.trim()) return true;
    if (searchMode === 'title') {
      return a.title.toLowerCase().includes(articleSearch.toLowerCase());
    } else {
      return (
        a.title.toLowerCase().includes(articleSearch.toLowerCase()) || 
        a.tags.some(t => t.toLowerCase().includes(articleSearch.toLowerCase())) || 
        a.content.toLowerCase().includes(articleSearch.toLowerCase()) ||
        a.summary.toLowerCase().includes(articleSearch.toLowerCase())
      );
    }
  });
  
  const articlePageSize = 10;
  const articleTotalPages = Math.ceil(filteredArticles.length / articlePageSize);
  const pagedArticles = filteredArticles.slice((articlePage-1)*articlePageSize, articlePage*articlePageSize);

  // 文章操作
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/articles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        // 删除成功，更新列表
        setArticles(articles.filter(a => a._id !== id));
        alert('文章已删除');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '删除失败');
      }
    } catch (err) {
      console.error('删除文章错误:', err);
      alert(err instanceof Error ? err.message : '删除文章失败，请重试');
    }
  };
  
  const handleEditArticle = (id: string) => {
    // 跳转到编辑页面，将文章ID作为查询参数传递
    router.push(`/admin/edit?id=${id}`);
  };
  
  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/articles/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editTitle,
          content: editContent
        })
      });
      
      if (response.ok) {
        // 编辑成功，更新列表
        const updatedData = await response.json();
        setArticles(arts => arts.map(a => 
          a._id === editingId ? { ...a, title: editTitle, content: editContent } : a
        ));
        setEditingId(null);
        setEditTitle('');
        setEditContent('');
        alert('文章已更新');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新失败');
      }
    } catch (err) {
      console.error('更新文章错误:', err);
      alert(err instanceof Error ? err.message : '更新文章失败，请重试');
    }
  };

  // 获取封面图片URL，支持新的路径格式
  const getCoverImage = (article: Article) => {
    if (!article.coverImage) {
      return '/images/default-image.svg';
    }
    
    // 过滤掉已知的无效或默认图片
    if (article.coverImage === 'default-cover.jpg' || 
        article.coverImage === '/default-cover.jpg' ||
        article.coverImage === 'http://26.26.26.1:3000/default-cover.jpg') {
      return '/images/default-image.svg';
    }
    
    // 过滤掉 blob URLs
    if (article.coverImage.startsWith('blob:')) {
      return '/images/default-image.svg';
    }
    
    // 使用统一的图片URL处理函数
    return getImageUrl(article.coverImage);
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      {/* 使用共享侧边栏组件 */}
      <AdminSidebar activeItem="articles" />
      
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 transition-all duration-300 md:ml-56">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8 mb-8">
          <h1 className="text-2xl font-bold text-[#FF6F61] mb-6 text-center">文章管理</h1>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button 
                className="ml-2 text-red-500 font-bold" 
                onClick={() => fetchArticles()}
              >
                重试
              </button>
            </div>
          )}
          
          {/* 搜索 */}
          <div className="mb-4 flex gap-2 items-center">
            <input 
              value={articleSearch} 
              onChange={e => setArticleSearch(e.target.value)} 
              placeholder="搜索文章标题/标签/内容" 
              className="border border-[#FF6F61] rounded px-2 py-1 flex-1" 
            />
            <Button
              variant={searchMode === 'title' ? 'primary' : 'outline'}
              className="px-4"
              onClick={() => setSearchMode('title')}
            >
              标题
            </Button>
            <Button
              variant={searchMode === 'full' ? 'primary' : 'outline'}
              className="px-4"
              onClick={() => setSearchMode('full')}
            >
              全文
            </Button>
            <Button
              className="bg-[#FF6F61] text-white px-4"
              onClick={fetchArticles}
            >
              刷新
            </Button>
          </div>
          
          {/* 写文章按钮 */}
          <div className="mb-6 flex justify-end">
            <Button 
              className="bg-[#FF6F61] text-white px-4" 
              onClick={() => router.push('/admin/write')}
            >
              写文章
            </Button>
          </div>
          
          {/* 文章列表 */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {pagedArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {articleSearch ? '没有找到匹配的文章' : '暂无文章，点击 "写文章" 创建第一篇文章'}
                </div>
              ) : (
                <ul className="space-y-4">
                  {pagedArticles.map(article => (
                    <li key={article._id} className="border border-[#FF6F61] rounded p-4 bg-[#FFFACD] flex">
                      {/* 封面图片 - 只有当确实有有效的封面图片时才显示 */}
                      {(article.coverImage || article.cover) &&
                        (
                          String(article.coverImage || article.cover).startsWith('/images/') ||
                          String(article.coverImage || article.cover).startsWith('/uploads/') ||
                          String(article.coverImage || article.cover).startsWith('http')
                        ) && (
                        <div className="w-24 h-24 mr-4 flex-shrink-0 overflow-hidden rounded border border-[#FF6F61]">
                          <img 
                            src={getCoverImage(article)} 
                            alt={article.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/images/default-image.svg';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* 文章内容 */}
                      <div className="flex-1">
                        {editingId === article._id ? (
                          <div className="flex flex-col gap-2">
                            <input 
                              value={editTitle} 
                              onChange={e => setEditTitle(e.target.value)} 
                              className="border border-[#FF6F61] rounded px-2 py-1" 
                            />
                            <textarea 
                              value={editContent} 
                              onChange={e => setEditContent(e.target.value)} 
                              className="border border-[#FF6F61] rounded px-2 py-1"
                              rows={5}
                            />
                            <div className="flex gap-2">
                              <Button className="bg-[#FF6F61] text-white px-4" onClick={handleSaveEdit}>保存</Button>
                              <Button className="px-4" onClick={() => setEditingId(null)}>取消</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                              <span className="font-bold text-lg text-[#FF6F61]">{article.title}</span>
                              <span className="px-2 py-0.5 rounded bg-[#FF6F61]/20 text-[#FF6F61] text-xs">{article.category}</span>
                              {article.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded bg-[#FF6F61] text-white text-xs">{tag}</span>
                              ))}
                            </div>
                            <div className="mb-2 text-sm text-gray-600">
                              {new Date(article.createdAt).toLocaleDateString('zh-CN')} · 
                              浏览: {article.views} · 
                              点赞: {article.likes} · 
                              收藏: {article.bookmarks} · 
                              评论: {article.comments?.length || 0}
                            </div>
                            <div className="mb-2 text-gray-700">{article.summary}</div>
                            <div className="flex gap-2">
                              <Button className="bg-[#FF6F61] text-white px-4" onClick={() => handleEditArticle(article._id)}>编辑</Button>
                              <Button className="px-4" onClick={() => handleDeleteArticle(article._id)}>删除</Button>
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* 分页器 */}
              {pagedArticles.length > 0 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button 
                    className="px-3" 
                    disabled={articlePage === 1} 
                    onClick={() => setArticlePage(p => Math.max(1, p-1))}
                  >
                    上一页
                  </Button>
                  <span className="text-[#FF6F61]">{articlePage} / {articleTotalPages || 1}</span>
                  <Button 
                    className="px-3" 
                    disabled={articlePage === articleTotalPages || articleTotalPages === 0} 
                    onClick={() => setArticlePage(p => Math.min(articleTotalPages, p+1))}
                  >
                    下一页
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