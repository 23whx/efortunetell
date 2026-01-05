'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  category: string | null;
  tags: string[];
  created_at: string;
};

export default function AdminArticlesPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
        .select('id,title,slug,status,category,tags,created_at')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      setRows((data || []) as ArticleRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.articles.loadFailed'));
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
    return rows.filter((r) => {
      const titleHit = (r.title || '').toLowerCase().includes(keyword);
      const slugHit = (r.slug || '').toLowerCase().includes(keyword);
      const tagsHit = (r.tags || []).some((tag) => (tag || '').toLowerCase().includes(keyword));
      return titleHit || slugHit || tagsHit;
    });
  }, [q, rows]);

  const remove = async (id: string) => {
    if (!confirm(t('admin.articles.confirmDelete'))) return;
    setBusyId(id);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.articles.deleteFailed'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex">
      <AdminSidebar activeItem="articles" />
      <main className="flex-1 ml-64 p-8 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">{t('admin.articles.title')}</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('admin.sidebar.articles')}</p>
            </div>
            <div className="flex gap-4">
              <button 
                className="px-6 py-3 rounded-2xl bg-white border border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                onClick={load} 
                disabled={loading}
              >
                {t('admin.articles.refresh')}
              </button>
              <button 
                className="px-8 py-3 rounded-2xl bg-[#FF6F61] text-white font-black shadow-xl shadow-[#FF6F61]/20 hover:scale-105 active:scale-95 transition-all"
                onClick={() => router.push('/admin/write')}
              >
                {t('admin.articles.new')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/20 p-8">
            <div className="relative mb-8">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('admin.articles.search')}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-[#FF6F61]/5 focus:bg-white focus:border-[#FF6F61]/20 transition-all outline-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin shadow-lg shadow-[#FF6F61]/20"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-4">
                  <span className="text-2xl text-gray-300">∅</span>
                </div>
                <p className="text-gray-400 font-bold">{t('admin.articles.empty')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((r) => (
                  <div key={r.id} className="group flex items-center justify-between p-6 rounded-3xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:shadow-gray-200/30 transition-all duration-500">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          r.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {r.status === 'published' ? t('admin.articles.status.published') : t('admin.articles.status.draft')}
                        </span>
                        {r.category && (
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            {t(`blog.category.${r.category.toLowerCase()}`) !== `blog.category.${r.category.toLowerCase()}` 
                              ? t(`blog.category.${r.category.toLowerCase()}`) 
                              : r.category}
                          </span>
                        )}
                        {(r.tags || []).slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-white border border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest"
                            title={tag}
                          >
                            {tag}
                          </span>
                        ))}
                        {(r.tags || []).length > 4 && (
                          <span className="px-3 py-1 rounded-full bg-white border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            +{(r.tags || []).length - 4}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-black text-gray-900 truncate group-hover:text-[#FF6F61] transition-colors">
                        {r.title}
                      </h2>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs font-bold text-gray-400">slug: {r.slug}</p>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <p className="text-xs font-bold text-gray-400">
                          {new Date(r.created_at).toLocaleDateString(t('common.locale') || 'en-US')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/admin/write?id=${encodeURIComponent(r.id)}`)}
                        className="p-3 rounded-2xl bg-white text-gray-400 hover:text-[#FF6F61] hover:bg-[#FF6F61]/5 transition-all shadow-sm border border-gray-100"
                      >
                        {t('admin.articles.edit')}
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        disabled={busyId === r.id}
                        className="p-3 rounded-2xl bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-gray-100"
                      >
                        {busyId === r.id ? '...' : t('admin.articles.delete')}
                      </button>
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


