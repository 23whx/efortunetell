'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter, useSearchParams } from 'next/navigation';
import { attachDraftImagesToArticle, deleteArticleImageByUrl, uploadArticleImage } from '@/lib/supabase/article-images';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import { ChevronLeft, Send, Save, Image as ImageIcon, X, Settings2, Info, Move, Minus, Plus, Grid, ChevronDown, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

// 动态导入编辑器以避免 SSR 问题
const Editor = dynamic(() => import('@/components/editor/Editor'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-gray-50 animate-pulse rounded-3xl" />
});

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Remote image URLs in an HTML string */
function imageUrls(html: string): Set<string> {
  return new Set([...html.matchAll(/<img[^>]+src="(https?:[^"]+)"/g)].map((m) => m[1]));
}

/** Visible characters, the way Chinese editors count words */
function countChars(html: string): number {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, '').length;
}

type LocalDraft = {
  title: string;
  summary: string;
  category: string;
  tags: string;
  coverImageUrl: string;
  coverImagePos: { x: number; y: number; zoom: number };
  contentHtml: string;
  draftKey: string;
  savedAt: number;
};
const localKey = (id: string | null) => `write-draft:${id ?? 'new'}`;

function readLocal(id: string | null): LocalDraft | null {
  try {
    const raw = localStorage.getItem(localKey(id));
    return raw ? (JSON.parse(raw) as LocalDraft) : null;
  } catch {
    return null;
  }
}

export default function AdminWritePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  // the id is set in place after a new article's first save
  const [articleId, setArticleId] = useState<string | null>(searchParams.get('id'));

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImagePos, setCoverImagePos] = useState({ x: 50, y: 50, zoom: 1 });
  const [contentHtml, setContentHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!articleId);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showPresets, setShowPresets] = useState(false);
  const [savedSlug, setSavedSlug] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [restorable, setRestorable] = useState<LocalDraft | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  // every remote image the article has referenced since it was opened; unused ones are deleted on save
  const knownImages = useRef<Set<string>>(new Set());

  const presets = [
    { name: t('blog.category.bazi'), url: '/cover/bazi.webp' },
    { name: t('blog.category.qimen'), url: '/cover/qimen.webp' },
    { name: t('keyword.bagua'), url: '/cover/bagua.webp' },
  ];

  // 加载现有文章
  useEffect(() => {
    if (!articleId) return;

    const loadArticle = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', articleId)
          .single();

        if (error) throw error;
        if (data) {
          setTitle(data.title || '');
          setSummary(data.summary || '');
          setCategory(data.category || '');
          setTags((data.tags || []).join(', '));
          setStatus(data.status);
          setCoverImageUrl(data.cover_image_url || '');
          setCoverImagePos(data.cover_image_pos || { x: 50, y: 50, zoom: 1 });
          setContentHtml(data.content_html || '');
          setSavedSlug(data.slug || '');
          knownImages.current = imageUrls(data.content_html || '');
          const local = readLocal(articleId);
          if (local && local.savedAt > new Date(data.updated_at || 0).getTime()) setRestorable(local);
        }
      } catch (e) {
        console.error('加载文章失败:', e);
        setError(t('admin.write.message.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
    // load once per opened article; a new article receiving its id must not reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // a new article offers the local draft left from last time
  useEffect(() => {
    if (articleId) return;
    const local = readLocal(null);
    if (local) setRestorable(local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draftKeyRef = useRef<string>('');
  if (!draftKeyRef.current) {
    try {
      draftKeyRef.current = globalThis.crypto?.randomUUID?.() ?? uuidv4();
    } catch {
      draftKeyRef.current = uuidv4();
    }
  }

  // keep the published URL stable: only a new article derives its slug from the title
  const slug = useMemo(() => savedSlug || slugify(title), [savedSlug, title]);
  const charCount = useMemo(() => countChars(contentHtml), [contentHtml]);

  // any edit marks the page dirty and is stashed locally after a short pause
  const editSig = JSON.stringify({ title, summary, category, tags, coverImageUrl, coverImagePos, contentHtml });
  const loadedSig = useRef<string | null>(null);
  useEffect(() => {
    if (loading) return;
    if (loadedSig.current === null) {
      loadedSig.current = editSig;
      return;
    }
    if (editSig === loadedSig.current) return;
    setDirty(true);
    const timer = setTimeout(() => {
      try {
        const draft: LocalDraft = { ...JSON.parse(editSig), draftKey: draftKeyRef.current, savedAt: Date.now() };
        localStorage.setItem(localKey(articleId), JSON.stringify(draft));
      } catch {
        /* storage full or blocked: the cloud save still works */
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [editSig, loading, articleId]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirty]);

  const restoreLocal = () => {
    if (!restorable) return;
    setTitle(restorable.title);
    setSummary(restorable.summary);
    setCategory(restorable.category);
    setTags(restorable.tags);
    setCoverImageUrl(restorable.coverImageUrl);
    setCoverImagePos(restorable.coverImagePos);
    setContentHtml(restorable.contentHtml);
    if (restorable.draftKey) draftKeyRef.current = restorable.draftKey;
    imageUrls(restorable.contentHtml).forEach((u) => knownImages.current.add(u));
    setEditorKey((k) => k + 1); // the editor only reads its content on mount
    setRestorable(null);
  };

  const discardLocal = () => {
    try { localStorage.removeItem(localKey(articleId)); } catch { /* ignore */ }
    setRestorable(null);
  };

  const handleCoverFile = async (file: File) => {
    setError(null);
    setUploadingCover(true);
    try {
      const res = await uploadArticleImage({
        file,
        kind: 'cover',
        articleId: null,
        draftKey: draftKeyRef.current,
      });
      setCoverImageUrl(res.publicUrl);
      setCoverImagePos({ x: 50, y: 50, zoom: 1 }); // 重置位置
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.write.cover.uploadFailed'));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!coverImageUrl) return;
    const container = e.currentTarget as HTMLDivElement;
    const rect = container.getBoundingClientRect();
    
    const startX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const startY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'clientX' in moveEvent ? moveEvent.clientX : moveEvent.touches[0].clientX;
      const currentY = 'clientY' in moveEvent ? moveEvent.clientY : moveEvent.touches[0].clientY;
      
      const deltaX = ((currentX - startX) / rect.width) * 100;
      const deltaY = ((currentY - startY) / rect.height) * 100;
      
      setCoverImagePos(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100, prev.x - deltaX / prev.zoom)),
        y: Math.max(0, Math.min(100, prev.y - deltaY / prev.zoom))
      }));
    };
    
    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  const handleInlineImageUpload = async (file: File) => {
    const res = await uploadArticleImage({
      file,
      kind: 'inline',
      articleId: null,
      draftKey: draftKeyRef.current,
    });
    knownImages.current.add(res.publicUrl);
    return res.publicUrl;
  };

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    if (saving) return;
    setError(null);
    if (!title.trim()) {
      setError(t('admin.write.message.titleRequired'));
      return;
    }
    if (!contentHtml.trim() || contentHtml === '<p></p>') {
      setError(t('admin.write.message.contentRequired'));
      return;
    }
    if (contentHtml.includes('src="blob:')) {
      setError(t('admin.write.message.uploading'));
      return;
    }

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error(t('fortune.loginRequired'));

      const finalStatus = targetStatus || status;

      const articleData = {
        author_id: user.id,
        title,
        slug: slug || `post-${Date.now()}`,
        summary: summary || null,
        content_html: contentHtml,
        category: category || null,
        tags: tags
          .split(/[，,]/)
          .map((t) => t.trim())
          .filter(Boolean),
        status: finalStatus,
        cover_image_url: coverImageUrl || null,
        cover_image_pos: coverImagePos,
      };

      let resultId = articleId;

      if (articleId) {
        // 更新现有文章
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);
        if (error) throw error;
      } else {
        // 新建文章
        const { data: inserted, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (!inserted?.id) throw new Error(t('admin.write.message.saveFailed'));
        resultId = inserted.id;
        setArticleId(inserted.id);
        setSavedSlug(articleData.slug);
        // stay on the page; later saves update this article
        window.history.replaceState(null, '', `/admin/write?id=${inserted.id}`);
      }

      await attachDraftImagesToArticle(draftKeyRef.current, resultId!);

      // images removed from the text are deleted only now, so undo before saving never breaks them
      const used = imageUrls(contentHtml);
      for (const url of knownImages.current) {
        if (!used.has(url)) deleteArticleImageByUrl(url).catch((err) => console.error('图片清理失败:', err));
      }
      knownImages.current = used;

      setStatus(finalStatus);
      setSavedAt(new Date());
      setDirty(false);
      loadedSig.current = editSig;
      try {
        localStorage.removeItem(localKey(null));
        localStorage.removeItem(localKey(resultId));
      } catch { /* ignore */ }
      
      // 如果文章已发布，自动触发向量化
      if (finalStatus === 'published') {
        try {
          const { triggerArticleEmbedding } = await import('@/lib/rag/auto-embed');
          await triggerArticleEmbedding(resultId!);
          console.log('Article embedding triggered successfully');
        } catch (embedError) {
          console.error('Failed to trigger article embedding:', embedError);
          // 不影响文章保存流程
        }
      }
      
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.write.message.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  });
  const onShortcut = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveRef.current();
    }
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, [onShortcut]);

  const statusText = saving
    ? t('admin.write.status.saving')
    : dirty
      ? t('admin.write.status.unsaved')
      : savedAt
        ? `${t('admin.write.status.saved')} ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : '';

  if (loading) {
    return (
      <div className="h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin shadow-lg shadow-[#FF6F61]/20"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#faf9f6] flex overflow-hidden">
      <AdminSidebar activeItem="articles" />
      
      <div className="flex flex-col flex-1 overflow-hidden ml-64">
        {/* 顶部工具栏 */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 px-6 shrink-0">
          <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
      <button
              onClick={() => router.push('/admin/articles')}
              className="p-2.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
      </button>
            <div className="h-6 w-[1px] bg-gray-200" />
            <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
              {articleId ? t('admin.write.title.edit') : t('admin.write.title.new')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 tabular-nums mr-1">{charCount} {t('admin.write.chars')}</span>
            {statusText && (
              <span className={`text-xs mr-2 ${dirty && !saving ? 'text-amber-600' : 'text-gray-400'}`} title={dirty ? t('admin.write.status.localHint') : undefined}>
                {statusText}
              </span>
            )}
            {articleId && status === 'published' && (
              <a
                href={`/zh/blog/${encodeURIComponent(slug || articleId)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#e25d50] mr-2"
              >
                {t('admin.write.viewArticle')}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            
            {status !== 'published' && (
              <Button 
                variant="default" 
                onClick={() => handleSave('draft')} 
                disabled={saving}
                className="inline-flex items-center whitespace-nowrap rounded-xl shadow-none border-none bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                {t('admin.write.button.saveDraft')}
              </Button>
            )}

        <Button
              onClick={() => handleSave('published')} 
              disabled={saving}
              className="inline-flex items-center whitespace-nowrap rounded-xl px-6 shadow-xl shadow-[#FF6F61]/20"
        >
              <Send className="w-4 h-4 mr-2" />
              {status === 'published' ? t('common.save') : t('admin.write.button.publish')}
        </Button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl transition-all ${showSettings ? 'bg-[#FF6F61]/10 text-[#FF6F61]' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <Settings2 className="w-6 h-6" />
            </button>
          </div>
        </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          <main className={`flex-1 overflow-y-auto transition-all duration-500 ease-in-out ${showSettings ? 'mr-80' : 'mr-0'} custom-scrollbar`}>
            <div className="max-w-3xl mx-auto pt-12 pb-10 px-6 min-h-full">
            {error && (
              <div className="sticky top-14 z-40 mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <span className="font-medium flex-1">{error}</span>
                <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600" aria-label="Close"><X className="w-4 h-4" /></button>
              </div>
            )}

            {restorable && (
              <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
                <span className="flex-1">
                  {t('admin.write.restore.found')} · {new Date(restorable.savedAt).toLocaleString()}
                </span>
                <button type="button" onClick={restoreLocal} className="rounded-lg bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-700">
                  {t('admin.write.restore.apply')}
                </button>
                <button type="button" onClick={discardLocal} className="rounded-lg px-3 py-1.5 text-amber-700 hover:bg-amber-100">
                  {t('admin.write.restore.discard')}
                </button>
              </div>
            )}

            {/* 标题输入区：自动换行，回车跳到正文 */}
            <textarea
              rows={1}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value.replace(/\n/g, ''));
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              ref={(el) => {
                if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  (document.querySelector('.tiptap') as HTMLElement | null)?.focus();
                }
              }}
              placeholder={t('admin.write.field.titlePlaceholder')}
              className="w-full resize-none overflow-hidden text-3xl md:text-4xl font-bold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent mb-6 leading-snug"
              autoFocus
            />

            {/* 编辑器主体 */}
            <Editor
              key={editorKey}
              content={contentHtml}
              onChange={setContentHtml}
              onImageUpload={handleInlineImageUpload}
              onError={setError}
            />
          </div>
          </main>

          {/* 右侧设置面板 */}
          <aside className={`absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-100 p-8 overflow-y-auto transition-all duration-500 ease-in-out z-40 custom-scrollbar ${showSettings ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="space-y-10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">{t('admin.write.cover.title')}</h3>
                {coverImageUrl && (
                  <button onClick={() => setCoverImageUrl('')} className="text-gray-300 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="relative group">
                {coverImageUrl ? (
                  <div className="space-y-4">
                    <div 
                      className="relative aspect-[16/10] rounded-[32px] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500 cursor-move bg-gray-100 border border-gray-100"
                      onMouseDown={handleDrag}
                      onTouchStart={handleDrag}
                    >
                      <div 
                        className="absolute inset-0 transition-transform duration-75 ease-out"
                        style={{
                          transform: `scale(${coverImagePos.zoom})`,
                          transformOrigin: `${coverImagePos.x}% ${coverImagePos.y}%`
                        }}
                      >
                        <Image 
                          src={coverImageUrl} 
                          alt="Cover" 
                          fill 
                          className="object-cover pointer-events-none" 
                          priority
                        />
                      </div>
                      
                      {/* 中心对齐辅助线 */}
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/30" />
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/30" />
                      </div>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="flex gap-3">
                          <label className="cursor-pointer bg-white/20 backdrop-blur-xl p-4 rounded-full hover:bg-white/40 transition-all hover:scale-110 active:scale-95">
                            <ImageIcon className="w-6 h-6 text-white" />
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => e.target.files?.[0] && handleCoverFile(e.target.files[0])}
                            />
                          </label>
                          <button 
                            onClick={() => setCoverImageUrl('')}
                            className="bg-red-500/20 backdrop-blur-xl p-4 rounded-full hover:bg-red-500/40 transition-all hover:scale-110 active:scale-95"
                          >
                            <X className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-xl rounded-2xl p-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <Move className="w-4 h-4 text-white/70" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest flex-1">{t('admin.write.cover.hint')}</span>
                      </div>
                    </div>

                    {/* 缩放控制栏 */}
                    <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                      <button 
                        onClick={() => setCoverImagePos(p => ({ ...p, zoom: Math.max(1, p.zoom - 0.1) }))}
                        className="p-2 rounded-xl bg-white shadow-sm hover:scale-110 active:scale-95 transition-all"
                      >
                        <Minus className="w-4 h-4 text-gray-400" />
                      </button>
                      <input 
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={coverImagePos.zoom}
                        onChange={(e) => setCoverImagePos(p => ({ ...p, zoom: parseFloat(e.target.value) }))}
                        className="flex-1 accent-[#FF6F61] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <button 
                        onClick={() => setCoverImagePos(p => ({ ...p, zoom: Math.min(3, p.zoom + 0.1) }))}
                        className="p-2 rounded-xl bg-white shadow-sm hover:scale-110 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-[16/10] rounded-[32px] border-2 border-dashed border-gray-100 hover:border-[#FF6F61]/30 bg-gray-50/30 hover:bg-[#FF6F61]/5 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="p-5 rounded-full bg-white shadow-sm mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-500">
                      {uploadingCover ? (
                        <div className="w-6 h-6 border-3 border-[#FF6F61] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-300 group-hover:text-[#FF6F61] transition-colors" />
                      )}
            </div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-[#FF6F61] transition-colors">{t('admin.write.cover.upload')}</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleCoverFile(e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* 预置封面选择 */}
              <div className="mt-4">
                <button 
                  onClick={() => setShowPresets(!showPresets)}
                  className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all text-[10px] font-black text-gray-400 uppercase tracking-widest"
                >
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    {t('admin.write.cover.selectPreset')}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                </button>
                
                {showPresets && (
                  <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-gray-50/50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.url}
                        onClick={() => {
                          setCoverImageUrl(preset.url);
                          setCoverImagePos({ x: 50, y: 50, zoom: 1 });
                          setShowPresets(false);
                        }}
                        className="group relative aspect-[16/10] rounded-xl overflow-hidden border-2 border-transparent hover:border-[#FF6F61] transition-all"
                      >
                        <Image src={preset.url} alt={preset.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
            <div>
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4">{t('admin.write.field.category')}</label>
                <div className="relative">
              <select 
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-[#FF6F61]/5 focus:bg-white focus:border-[#FF6F61]/20 appearance-none transition-all cursor-pointer"
                value={category} 
                    onChange={(e) => setCategory(e.target.value)}
              >
                    <option value="">{t('admin.write.field.category')}</option>
                <option value="八字">{t('blog.category.bazi')}</option>
                <option value="大六壬">{t('blog.category.liuren')}</option>
                <option value="阴盘奇门">{t('blog.category.qimen')}</option>
                    <option value="风水">{t('blog.category.fengshui')}</option>
                    <option value="起名">{t('blog.category.naming')}</option>
                <option value="梅花易数">{t('category.plumFortune')}</option>
                <option value="杂谈">{t('category.discussion')}</option>
              </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Settings2 className="w-4 h-4" />
                  </div>
            </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4">{t('admin.write.field.tags')}</label>
                <input
                  type="text"
                  placeholder={t('admin.write.field.tags') + "..."}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-[#FF6F61]/5 focus:bg-white focus:border-[#FF6F61]/20 transition-all outline-none"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                    />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const normalized = tags
                        .split(/[，,]/)
                        .map((t) => t.trim())
                        .filter(Boolean);
                      if (normalized.includes('八字理论')) return;
                      const next = [...normalized, '八字理论'].join(', ');
                      setTags(next);
                      if (!category) setCategory('八字');
                    }}
                    className="px-3 py-1.5 rounded-full bg-white text-[#FF6F61] text-[10px] font-black uppercase tracking-widest border border-[#FF6F61]/20 hover:bg-[#FF6F61] hover:text-white transition-colors"
                    title="添加“八字理论”标签；该标签文章不会在首页列表显示，只会在 专题-八字 页面展示"
                  >
                    + 八字理论
                  </button>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wide">
                    （该标签文章不在首页显示，仅在“专题-八字”中展示）
                  </span>
                </div>
                  </div>

              <div>
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4">{t('admin.write.field.summary')}</label>
              <textarea
                  placeholder={t('admin.write.field.summary') + "..."}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-[28px] px-6 py-5 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-[#FF6F61]/5 focus:bg-white focus:border-[#FF6F61]/20 transition-all min-h-[160px] resize-none outline-none leading-relaxed"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
              />
            </div>

              <div className="p-6 bg-[#FF6F61]/5 rounded-3xl border border-[#FF6F61]/10">
                <div className="flex items-center gap-3 text-[#FF6F61] mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF6F61] flex items-center justify-center shadow-lg shadow-[#FF6F61]/20">
                    <Info className="w-4 h-4 text-white" />
            </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin.write.tip.title')}</span>
            </div>
                <p className="text-[11px] text-[#FF6F61]/70 font-bold leading-relaxed">
                  {t('admin.write.tip.content')}
                </p>
                    </div>
                  </div>
              </div>
        </aside>
            </div>
            </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.1);
        }
        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
