'use client';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';

interface BlogDetailPageProps {
  params: { id: string }
}

const mockArticle = {
  id: '1',
  title: '八字命理入门指南',
  tags: ['八字', '命理'],
  author: '张大师',
  date: '2024-06-01',
  content: '这里是文章内容详情……',
  likes: 12,
  bookmarks: 5,
  comments: [
    { user: 'yonghu1', content: '写得很好！', date: '2024-06-02', replies: [
      { user: 'admin', content: '感谢支持！', date: '2024-06-03' }
    ] },
    { user: 'admin', content: '欢迎讨论。', date: '2024-06-03', replies: [] },
  ],
};

type CommentType = {
  user: string;
  content: string;
  date: string;
  replies?: CommentType[];
};

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<CommentType[]>(mockArticle.comments);
  const [replyIdx, setReplyIdx] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [tip, setTip] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const u = localStorage.getItem('user');
    const a = localStorage.getItem('admin');
    setUser(u ? JSON.parse(u) : null);
    setAdmin(a ? JSON.parse(a) : null);
  }, []);

  useEffect(() => {
    if (tip) {
      const timer = setTimeout(() => setTip(null), 800);
      return () => clearTimeout(timer);
    }
  }, [tip]);

  if (!params.id) return notFound();

  const article = mockArticle;

  const handleTagClick = (tag: string) => {
    router.push(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  const handleLike = () => {
    alert('点赞成功！');
  };
  const handleBookmark = () => {
    alert('收藏成功！');
  };
  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setTip({ type: 'error', msg: '评论失败' });
      return;
    }
    const userName = user?.username || admin?.username || '匿名';
    setComments([
      ...comments,
      { user: userName, content: comment, date: new Date().toISOString().slice(0, 10), replies: [] },
    ]);
    setComment('');
    setTip({ type: 'success', msg: '评论成功' });
  };
  const canComment = !!user || !!admin;

  // 追评
  const handleReply = (idx: number) => {
    if (!replyContent.trim()) {
      setTip({ type: 'error', msg: '评论失败' });
      return;
    }
    const userName = user?.username || admin?.username || '匿名';
    setComments(comments =>
      comments.map((c, i) =>
        i === idx
          ? {
              ...c,
              replies: [...(c.replies || []), { user: userName, content: replyContent, date: new Date().toISOString().slice(0, 10) }],
            }
          : c
      )
    );
    setReplyContent('');
    setReplyIdx(null);
    setTip({ type: 'success', msg: '评论成功' });
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFACD]">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8 relative">
        {/* 动态提示 */}
        {tip && (
          <div
            className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 px-6 py-2 rounded shadow-lg text-white text-base font-medium transition-all duration-300
              ${tip.type === 'success' ? 'bg-[#34C759] animate-fadeInOut' : 'bg-[#FF6F61] animate-fadeInOut'}`}
            style={{ pointerEvents: 'none' }}
          >
            {tip.msg}
          </div>
        )}
        <style>{`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
          .animate-fadeInOut {
            animation: fadeInOut 0.8s both;
          }
        `}</style>
        <h1 className="text-3xl font-bold mb-4 text-[#FF6F61]">{article.title}</h1>
        <div className="mb-4 flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              className="border-[#FF6F61] text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white px-3 py-1 text-xs"
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </Button>
          ))}
        </div>
        <div className="mb-4 text-gray-500 text-sm">{article.author} · {article.date}</div>
        <div className="prose max-w-none mb-6 text-gray-900">
          <p>{article.content}</p>
        </div>
        <div className="flex gap-4 mb-6">
          <Button type="button" className="flex items-center gap-1 border-[#FF6F61] text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white" variant="outline" onClick={handleLike}>
            <span>👍</span> 点赞
          </Button>
          <Button type="button" className="flex items-center gap-1 border-[#FF6F61] text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white" variant="outline" onClick={handleBookmark}>
            <span>⭐</span> 收藏
          </Button>
        </div>
        <div className="mb-4 font-semibold text-[#FF6F61]">评论</div>
        <ul className="mb-6 space-y-4">
          {comments.map((c, idx) => (
            <li key={idx} className="bg-[#FFFACD] border border-[#FF6F61] rounded px-3 py-2 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[#FF6F61]">{c.user}</span>
                <span className="text-gray-400 text-xs">{c.date}</span>
              </div>
              <div className="text-gray-700 mb-2">{c.content}</div>
              {/* 子评论 */}
              {c.replies && c.replies.length > 0 && (
                <ul className="pl-4 border-l-2 border-[#FF6F61] space-y-2 mb-2">
                  {c.replies.map((r, ridx) => (
                    <li key={ridx} className="flex items-center gap-2">
                      <span className="font-bold text-[#FF6F61]">{r.user}</span>
                      <span className="text-gray-400 text-xs">{r.date}</span>
                      <span className="text-gray-700">{r.content}</span>
                    </li>
                  ))}
                </ul>
              )}
              {/* 追评输入框 */}
              {canComment && replyIdx === idx ? (
                <form className="flex gap-2 mt-2" onSubmit={e => { e.preventDefault(); handleReply(idx); }}>
                  <input
                    type="text"
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="回复评论..."
                    className="flex-1 px-2 py-1 rounded border border-[#FF6F61] focus:ring-2 focus:ring-[#FF6F61] focus:outline-none text-sm"
                  />
                  <Button type="submit" className="bg-[#FF6F61] text-white px-4 py-1 text-sm">发表追评</Button>
                  <Button type="button" className="px-2 py-1 text-sm" onClick={() => { setReplyIdx(null); setReplyContent(''); }}>取消</Button>
                </form>
              ) : canComment ? (
                <Button type="button" className="text-xs text-[#FF6F61] underline" onClick={() => { setReplyIdx(idx); setReplyContent(''); }}>追评</Button>
              ) : null}
            </li>
          ))}
        </ul>
        {canComment && (
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="写下你的评论..."
              className="flex-1 px-3 py-2 rounded border border-[#FF6F61] focus:ring-2 focus:ring-[#FF6F61] focus:outline-none"
            />
            <Button type="submit" className="bg-[#FF6F61] text-white px-6">发表评论</Button>
          </form>
        )}
        {!canComment && (
          <div className="text-gray-400 text-sm">请登录用户或管理员账号后发表评论</div>
        )}
      </div>
    </div>
  );
} 