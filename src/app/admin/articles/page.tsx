'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  category: string | null;
  created_at: string;
};

export default function AdminArticlesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('articles')
        .select('id,title,slug,status,category,created_at')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      setRows((data || []) as ArticleRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((r) => (r.title || '').toLowerCase().includes(keyword) || (r.slug || '').toLowerCase().includes(keyword));
  }, [q, rows]);

  const remove = async (id: string) => {
    if (!confirm('确定要删除该文章吗？')) return;
    setBusyId(id);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      <AdminSidebar activeItem="articles" />
      <main className="flex-1 ml-0 md:ml-56 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <h1 className="text-2xl font-bold text-[#FF6F61]">文章管理</h1>
              <div className="flex gap-2">
                <Button className="bg-gray-200 text-gray-800" onClick={load} disabled={loading}>
                  刷新
                </Button>
                <Button className="bg-[#FF6F61] text-white" onClick={() => router.push('/admin/write')}>
                  新建文章
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索标题/slug"
                className="w-full border border-[#FF6F61] rounded px-3 py-2"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500">暂无文章</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between gap-3 flex-wrap">
                      <div className="min-w-[240px]">
                        <div className="font-semibold text-gray-900">{r.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="mr-2">slug: {r.slug}</span>
                          <span className="mr-2">状态: {r.status}</span>
                          {r.category && <span>分类: {r.category}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-[#FF6F61] text-white"
                          onClick={() => router.push(`/admin/edit?id=${encodeURIComponent(r.id)}`)}
                        >
                          编辑
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => remove(r.id)}
                          disabled={busyId === r.id}
                        >
                          {busyId === r.id ? '处理中...' : '删除'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


