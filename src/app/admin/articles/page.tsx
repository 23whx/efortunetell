"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';

// 模拟文章数据
const mockArticles = [
  { id: '1', title: '八字命理入门指南', tags: ['八字', '命理'], content: '八字内容...', comments: [
    { id: 1, user: 'yonghu1', content: '写得很好！', date: '2024-06-02' },
    { id: 2, user: 'admin', content: '欢迎讨论。', date: '2024-06-03' },
  ] },
  { id: '2', title: '大六壬实战案例分析', tags: ['大六壬'], content: '大六壬内容...', comments: [
    { id: 3, user: 'yonghu2', content: '有收获！', date: '2024-06-04' },
  ] },
];

export default function ArticleManagement() {
  // 状态管理
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const [articles, setArticles] = useState(mockArticles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'title' | 'full'>('full');
  // 分页相关
  const [articlePage, setArticlePage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      setAdmin(JSON.parse(stored));
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  // 文章过滤和分页
  const filteredArticles = articles.filter(a => {
    if (!articleSearch.trim()) return true;
    if (searchMode === 'title') {
      return a.title.includes(articleSearch);
    } else {
      return a.title.includes(articleSearch) || a.tags.some(t => t.includes(articleSearch)) || a.content.includes(articleSearch);
    }
  });
  const articlePageSize = 10;
  const articleTotalPages = Math.ceil(filteredArticles.length / articlePageSize);
  const pagedArticles = filteredArticles.slice((articlePage-1)*articlePageSize, articlePage*articlePageSize);

  // 文章操作
  const handleDeleteArticle = (id: string) => {
    setArticles(arts => arts.filter(a => a.id !== id));
  };
  
  const handleEditArticle = (id: string) => {
    const art = articles.find(a => a.id === id);
    if (art) {
      setEditingId(id);
      setEditTitle(art.title);
      setEditContent(art.content);
    }
  };
  
  const handleSaveEdit = () => {
    setArticles(arts => arts.map(a => a.id === editingId ? { ...a, title: editTitle, content: editContent } : a));
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };
  
  const handleAddArticle = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setArticles(arts => [
      ...arts,
      {
        id: (Math.max(...arts.map(a => +a.id), 0) + 1).toString(),
        title: newTitle,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        content: newContent,
        comments: [],
      },
    ]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
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
          {/* 搜索 */}
          <div className="mb-4 flex gap-2 items-center">
            <input value={articleSearch} onChange={e => setArticleSearch(e.target.value)} placeholder="搜索文章标题/标签/内容" className="border border-[#FF6F61] rounded px-2 py-1 flex-1" />
            <Button
              className="bg-[#FF6F61] text-white px-4"
              onClick={() => setSearchMode('title')}
            >
              搜索标题
            </Button>
            <Button
              className="bg-[#FF6F61] text-white px-4"
              onClick={() => setSearchMode('full')}
            >
              搜索全文
            </Button>
          </div>
          {/* 写文章按钮 */}
          <div className="mb-6 flex justify-end">
            <Button className="bg-[#FF6F61] text-white px-4" onClick={() => router.push('/admin/write')}>写文章</Button>
          </div>
          {/* 文章列表 */}
          <ul className="space-y-4">
            {pagedArticles.map(article => (
              <li key={article.id} className={`border border-[#FF6F61] rounded p-4 bg-[#FFFACD] ${articleSearch && ((searchMode === 'title' && article.title.includes(articleSearch)) || (searchMode === 'full' && (article.title.includes(articleSearch) || article.tags.some(t => t.includes(articleSearch)) || article.content.includes(articleSearch)))) ? 'ring-2 ring-[#FF6F61] ring-offset-2' : ''}`}>
                {editingId === article.id ? (
                  <div className="flex flex-col gap-2">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="border border-[#FF6F61] rounded px-2 py-1" />
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="border border-[#FF6F61] rounded px-2 py-1" />
                    <div className="flex gap-2">
                      <Button className="bg-[#FF6F61] text-white px-4" onClick={handleSaveEdit}>保存</Button>
                      <Button className="px-4" onClick={() => setEditingId(null)}>取消</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <span className="font-bold text-lg text-[#FF6F61]">{article.title}</span>
                      {article.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-[#FF6F61] text-white text-xs">{tag}</span>
                      ))}
                    </div>
                    <div className="mb-2 text-gray-700">{article.content}</div>
                    <div className="flex gap-2">
                      <Button className="bg-[#FF6F61] text-white px-4" onClick={() => handleEditArticle(article.id)}>编辑</Button>
                      <Button className="px-4" onClick={() => handleDeleteArticle(article.id)}>删除</Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          {/* 分页器 */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button className="px-3" disabled={articlePage === 1} onClick={() => setArticlePage(p => Math.max(1, p-1))}>上一页</Button>
            <span className="text-[#FF6F61]">{articlePage} / {articleTotalPages || 1}</span>
            <Button className="px-3" disabled={articlePage === articleTotalPages || articleTotalPages === 0} onClick={() => setArticlePage(p => Math.min(articleTotalPages, p+1))}>下一页</Button>
          </div>
        </div>
      </main>
    </div>
  );
} 