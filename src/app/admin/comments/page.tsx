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

export default function CommentManagement() {
  // 状态管理
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const [articles, setArticles] = useState(mockArticles);
  const [commentSearch, setCommentSearch] = useState('');
  const [commentSearchInput, setCommentSearchInput] = useState('');
  // 分页相关
  const [commentPage, setCommentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      setAdmin(JSON.parse(stored));
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  // 评论数据处理
  const allComments = articles.flatMap(article =>
    article.comments.map(c => ({ ...c, articleId: article.id, articleTitle: article.title }))
  );
  const filteredComments = allComments.filter(c =>
    c.content.includes(commentSearch)
  );
  const commentPageSize = 20;
  const commentTotalPages = Math.ceil(filteredComments.length / commentPageSize);
  const pagedComments = filteredComments.slice((commentPage-1)*commentPageSize, commentPage*commentPageSize);

  // 评论操作
  const handleDeleteComment = (articleId: string, commentId: number) => {
    setArticles(arts => arts.map(a =>
      a.id === articleId ? { ...a, comments: a.comments.filter(c => c.id !== commentId) } : a
    ));
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      {/* 使用共享侧边栏组件 */}
      <AdminSidebar activeItem="comments" />
      
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 transition-all duration-300 md:ml-56">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8">
          <h2 className="text-xl font-bold text-[#FF6F61] mb-6 text-center">评论管理</h2>
          {/* 搜索 */}
          <div className="mb-4 flex gap-2 items-center">
            <input value={commentSearchInput} onChange={e => setCommentSearchInput(e.target.value)} placeholder="搜索评论内容" className="border border-[#FF6F61] rounded px-2 py-1 flex-1" />
            <Button className="bg-[#FF6F61] text-white px-4" onClick={() => { setCommentSearch(commentSearchInput); setCommentPage(1); }}>搜索</Button>
          </div>
          <ul className="space-y-3">
            {pagedComments.map(c => (
              <li key={c.id} className="border border-[#FF6F61] rounded px-4 py-2 bg-[#FFFACD] flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <span className="font-bold text-[#FF6F61]">{c.user}</span>
                  <span className="text-gray-400 text-xs ml-2">{c.date}</span>
                  <span className="ml-2 text-gray-700">{c.content}</span>
                  <span className="ml-4 text-xs text-[#FF6F61] cursor-pointer underline" onClick={() => router.push(`/blog/${c.articleId}`)}>
                    所属文章：{c.articleTitle}
                  </span>
                </div>
                <Button className="px-4" onClick={() => handleDeleteComment(c.articleId, c.id)}>删除</Button>
              </li>
            ))}
          </ul>
          {/* 分页器 */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button className="px-3" disabled={commentPage === 1} onClick={() => setCommentPage(p => Math.max(1, p-1))}>上一页</Button>
            <span className="text-[#FF6F61]">{commentPage} / {commentTotalPages || 1}</span>
            <Button className="px-3" disabled={commentPage === commentTotalPages || commentTotalPages === 0} onClick={() => setCommentPage(p => Math.min(commentTotalPages, p+1))}>下一页</Button>
          </div>
        </div>
      </main>
    </div>
  );
} 