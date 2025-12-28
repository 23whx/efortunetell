'use client';

import { useMemo, useState, useEffect } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter, useSearchParams } from 'next/navigation';
import { attachDraftImagesToArticle, uploadArticleImage } from '@/lib/supabase/article-images';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import { ChevronLeft, Send, Save, Image as ImageIcon, X, Settings2, Info, Move, Minus, Plus, Grid, ChevronDown } from 'lucide-react';
import Image from 'next/image';

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

export default function AdminWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');

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

  const presets = [
    { name: '八字', url: '/cover/bazi.png' },
    { name: '奇门', url: '/cover/qimen.png' },
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
        }
      } catch (e) {
        console.error('加载文章失败:', e);
        setError('无法加载文章数据');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  const draftKey = useMemo(() => {
    try {
      return globalThis.crypto?.randomUUID?.() ?? uuidv4();
    } catch {
      return uuidv4();
    }
  }, []);

  const slug = useMemo(() => slugify(title), [title]);

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
      setCoverImagePos({ x: 50, y: 50, zoom: 1 }); // 重置位置
    } catch (e) {
      setError(e instanceof Error ? e.message : '封面图上传失败');
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
      draftKey,
    });
    return res.publicUrl;
  };

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    setError(null);
    if (!title.trim()) {
      setError('给文章起个动人的标题吧');
      return;
    }
    if (!contentHtml.trim() || contentHtml === '<p></p>') {
      setError('内容不能为空哦');
      return;
    }

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error('未登录');

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
        if (!inserted?.id) throw new Error('保存失败（未返回文章ID）');
        resultId = inserted.id;
      }

      await attachDraftImagesToArticle(draftKey, resultId!);
        router.push('/admin/articles');
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

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
            <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">新建文章</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 mr-4 uppercase tracking-widest">
              {saving ? '正在保存...' : '已同步至云端'}
            </span>
            
            {status !== 'published' && (
              <Button 
                variant="default" 
                onClick={() => handleSave('draft')} 
                disabled={saving}
                className="rounded-xl shadow-none border-none bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                存草稿
              </Button>
            )}

        <Button
              onClick={() => handleSave('published')} 
              disabled={saving}
              className="rounded-xl px-8 shadow-xl shadow-[#FF6F61]/20"
        >
              <Send className="w-4 h-4 mr-2" />
              {status === 'published' ? '更新文章' : '发布文章'}
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
            <div className="max-w-4xl mx-auto py-20 px-6 min-h-full">
            {error && (
              <div className="mb-12 p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* 标题输入区 */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入标题..."
              className="w-full text-5xl md:text-6xl font-black text-gray-900 placeholder:text-gray-100 border-none outline-none bg-transparent mb-12 tracking-tighter leading-[1.1]"
              autoFocus
            />

            {/* 编辑器主体 */}
            <Editor 
              content={contentHtml} 
              onChange={setContentHtml}
              onImageUpload={handleInlineImageUpload}
            />
          </div>
          </main>

          {/* 右侧设置面板 */}
          <aside className={`absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-100 p-8 overflow-y-auto transition-all duration-500 ease-in-out z-40 custom-scrollbar ${showSettings ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="space-y-10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">文章封面</h3>
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
                        <span className="text-[10px] font-black text-white uppercase tracking-widest flex-1">拖拽调整位置</span>
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
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-[#FF6F61] transition-colors">上传封面图</span>
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
                    选择预置封面
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
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4">分类</label>
                <div className="relative">
              <select 
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-[#FF6F61]/5 focus:bg-white focus:border-[#FF6F61]/20 appearance-none transition-all cursor-pointer"
                value={category} 
                    onChange={(e) => setCategory(e.target.value)}
              >
                    <option value="">请选择分类</option>
                <option value="八字">八字</option>
                <option value="大六壬">大六壬</option>
                <option value="阴盘奇门">阴盘奇门</option>
                    <option value="风水">风水</option>
                    <option value="起名">起名</option>
                <option value="梅花易数">梅花易数</option>
                <option value="杂谈">杂谈</option>
              </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Settings2 className="w-4 h-4" />
                  </div>
            </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4">标签</label>
                <input
                  type="text"
                  placeholder="用逗号分隔..."
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-[#FF6F61]/5 focus:bg-white focus:border-[#FF6F61]/20 transition-all outline-none"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

              <div>
                <label className="block text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4">摘要</label>
              <textarea
                  placeholder="选填，若不填将自动截取正文..."
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
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">写作建议</span>
            </div>
                <p className="text-[11px] text-[#FF6F61]/70 font-bold leading-relaxed">
                  直接将图片拖入正文即可自动上传。选中文字可触发气泡菜单进行快速排版。建议文章摘要控制在 100 字以内以获得最佳展示效果。
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
