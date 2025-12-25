'use client';

import { useMemo, useRef, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { attachDraftImagesToArticle, uploadArticleImage } from '@/lib/supabase/article-images';
import { v4 as uuidv4 } from 'uuid';

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
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  const draftKey = useMemo(() => {
    try {
      return globalThis.crypto?.randomUUID?.() ?? uuidv4();
    } catch {
      return uuidv4();
    }
  }, []);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const slug = useMemo(() => slugify(title), [title]);

  const insertAtCursor = (snippet: string) => {
    const el = contentRef.current;
    if (!el) {
      setContentHtml((prev) => (prev ? `${prev}\n${snippet}` : snippet));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + snippet + el.value.slice(end);
    setContentHtml(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleCoverFile = async (file: File) => {
    setError(null);
    setUploadingCover(true);
    try {
      const res = await uploadArticleImage({
        file,
        kind: 'cover',
        articleId: null,
        draftKey,
      });
      setCoverImageUrl(res.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : '封面图上传失败');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleInlineFile = async (file: File) => {
    setError(null);
    setUploadingInline(true);
    try {
      const res = await uploadArticleImage({
        file,
        kind: 'inline',
        articleId: null,
        draftKey,
      });
      insertAtCursor(`\n<img src="${res.publicUrl}" alt="" />\n`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '插图上传失败');
    } finally {
      setUploadingInline(false);
    }
  };

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

      const { data: inserted, error } = await supabase
        .from('articles')
        .insert({
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
        })
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!inserted?.id) throw new Error('保存失败（未返回文章ID）');

      // Attach any images uploaded during draft editing.
      await attachDraftImagesToArticle(draftKey, inserted.id);

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">封面图（上传并自动压缩）</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border border-[#FF6F61] rounded px-3 py-2"
                      disabled={uploadingCover}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleCoverFile(f);
                        e.currentTarget.value = '';
                      }}
                    />
                  </div>
                  {coverImageUrl ? (
                    <div className="text-xs text-gray-600 mt-1 break-all">
                      已上传：{coverImageUrl}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">
                      {uploadingCover ? '封面图上传/压缩中...' : '上传后会自动写入数据库并保存 URL'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">正文（HTML） *</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingInline}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleInlineFile(f);
                      e.currentTarget.value = '';
                    }}
                  />
                  <div className="text-xs text-gray-500">
                    {uploadingInline ? '插图上传/压缩中...' : '选择图片会自动插入 <img> 到当前光标位置'}
                  </div>
                </div>
                <textarea
                  className="w-full border border-[#FF6F61] rounded px-3 py-2 font-mono text-sm"
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  ref={contentRef}
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


