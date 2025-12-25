'use client';

import { useMemo, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const slug = useMemo(() => slugify(title), [title]);

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }
    if (!slug) {
      setError('无法生成 slug，请换一个标题');
      return;
    }
    if (!contentHtml.trim()) {
      setError('正文不能为空（HTML）');
      return;
    }

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) throw new Error('未登录');

      const { error } = await supabase.from('articles').insert({
        author_id: user.id,
        title,
        slug,
        summary: summary || null,
        content_html: contentHtml,
        category: category || null,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status,
        cover_image_url: coverImageUrl || null,
      });
      if (error) throw error;

      router.push('/admin/articles');
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      <AdminSidebar activeItem="articles" />
      <main className="flex-1 ml-0 md:ml-56 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
              <h1 className="text-2xl font-bold text-[#FF6F61]">新建文章</h1>
              <div className="flex gap-2">
                <Button className="bg-gray-200 text-gray-800" onClick={() => router.push('/admin/articles')}>
                  返回
                </Button>
                <Button className="bg-[#FF6F61] text-white" onClick={handleSave} disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <input
                  className="w-full border border-[#FF6F61] rounded px-3 py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入标题"
                />
                <div className="text-xs text-gray-500 mt-1">slug: {slug || '(空)'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
                <textarea
                  className="w-full border border-[#FF6F61] rounded px-3 py-2"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <input
                    className="w-full border border-[#FF6F61] rounded px-3 py-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="例如：八字 / 杂谈"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
                  <input
                    className="w-full border border-[#FF6F61] rounded px-3 py-2"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="例如：命理,八字,随笔"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select
                    className="w-full border border-[#FF6F61] rounded px-3 py-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  >
                    <option value="published">published</option>
                    <option value="draft">draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">封面图 URL（可选）</label>
                  <input
                    className="w-full border border-[#FF6F61] rounded px-3 py-2"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="Supabase Storage public url..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">正文（HTML） *</label>
                <textarea
                  className="w-full border border-[#FF6F61] rounded px-3 py-2 font-mono text-sm"
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  rows={16}
                  placeholder="<p>...</p>"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


