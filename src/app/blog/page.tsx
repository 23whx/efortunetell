'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Calendar } from "lucide-react";
import Button from '@/components/ui/button';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/utils/date';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

// 文章接口定义
interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content_html: string;
  category: string | null;
  tags: string[];
  cover_image_url: string | null;
  cover_image_pos: { x: number; y: number; zoom: number } | null;
  created_at: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
}

export default function BlogPage() {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 分类映射：将翻译键映射到后端存储的中文分类名
  const categoryMapping = {
    [t('common.all')]: null,
    [t('blog.category.bazi')]: '八字',
    [t('blog.category.liuren')]: '大六壬', 
    [t('blog.category.qimen')]: '阴盘奇门',
    [t('blog.category.naming')]: '起名',
    [t('blog.category.fengshui')]: '风水',
    [t('category.plumFortune')]: '梅花易数',
    [t('category.discussion')]: '杂谈',
    [t('category.other')]: '其他'
  };
  
  const categories = [
    t('common.all'), 
    t('blog.category.bazi'), 
    t('blog.category.liuren'), 
    t('blog.category.qimen'), 
    t('blog.category.fengshui'),
    t('blog.category.naming'),
    t('category.plumFortune'),
    t('category.discussion'), 
    t('category.other')
  ];
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDisplayCategory, setSelectedDisplayCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'likes' | 'bookmarks'>('date');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced Scroll & Drag logic for Category Bar
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false); // 用于区分点击和拖拽
  const [showLeftBlur, setShowLeftBlur] = useState(false);
  const [showRightBlur, setShowRightBlur] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftBlur(scrollLeft > 10);
    setShowRightBlur(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // 鼠标按下：开始记录位置
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    // 记录初始位置
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  // 鼠标移动：计算滚动偏移
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 滚动倍率
    
    // 如果移动距离超过 5 像素，判定为拖拽而非点击
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  // 鼠标松开/离开：结束拖拽
  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  const scrollByAmount = (amount: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + amount,
      behavior: 'smooth'
    });
  };

  // 拦截点击事件：如果是拖拽行为，则阻止按钮触发
  const handleCategoryClickWithDrag = (e: React.MouseEvent, category: string) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    handleCategoryClick(category);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleScroll();
    }, 100);
    window.addEventListener('resize', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleScroll);
    };
  }, [articles, isClient]);

  const [error, setError] = useState<string | null>(null);
  const [setupHint, setSetupHint] = useState<string | null>(null);

  // 加载文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        setSetupHint(null);

        const supabase = createSupabaseBrowserClient();

        let q = supabase
          .from('articles')
          .select('id,title,slug,summary,content_html,category,tags,cover_image_url,cover_image_pos,created_at,author_id')
          .eq('status', 'published')
          .not('tags', 'cs', '{"八字理论"}') // 排除"八字理论"标签的文章
          .limit(100);

        if (selectedCategory) {
          q = q.eq('category', selectedCategory);
        }
        
        let { data, error: qErr } = await q;
        
        // Handle missing column error gracefully (fallback for users who haven't updated schema)
        if (qErr && (qErr as any).code === '42703') {
          console.warn('cover_image_pos column missing, falling back...');
          const fallbackQ = supabase
            .from('articles')
            .select('id,title,slug,summary,content_html,category,tags,cover_image_url,created_at,author_id')
            .eq('status', 'published')
            .not('tags', 'cs', '{"八字理论"}') // 排除"八字理论"标签的文章
            .limit(100);
            
          if (selectedCategory) {
            fallbackQ.eq('category', selectedCategory);
          }
          
          const { data: fallbackData, error: fallbackErr } = await fallbackQ;
          if (fallbackErr) throw fallbackErr;
          // Add cover_image_pos field with null value for type compatibility
          data = fallbackData?.map(article => ({ ...article, cover_image_pos: null })) || null;
          qErr = null;
        }

        if (qErr) {
          // Common fresh-project case: schema not applied yet.
          // PGRST205: table not found in schema cache.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const code = (qErr as any)?.code;
          if (code === 'PGRST205') {
            setSetupHint(t('blog.setupHint') || 'Supabase 还没建表：请先在 Supabase SQL Editor 执行项目里的 supabase/schema.sql');
            setArticles([]);
            return;
          }
          throw qErr;
        }

        const authorIds = Array.from(new Set((data || []).map((a) => a.author_id).filter(Boolean)));
        const authorMap = new Map<string, { display_name: string; avatar_url: string | null }>();

        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id,display_name,avatar_url')
            .in('id', authorIds);

          (profiles || []).forEach((p) => {
            authorMap.set(p.id, {
              display_name: p.display_name || '',
              avatar_url: p.avatar_url || null
            });
          });
        }

        const mapped: Article[] = (data || []).map((a) => {
          const author = authorMap.get(a.author_id);
          return {
            id: a.id,
            title: a.title,
            slug: a.slug,
            summary: a.summary,
            content_html: a.content_html,
            category: a.category,
            tags: a.tags || [],
            cover_image_url: a.cover_image_url,
            cover_image_pos: a.cover_image_pos,
            created_at: a.created_at,
            author_display_name: author?.display_name || null,
            author_avatar_url: author?.avatar_url || null,
          };
        });

        setArticles(mapped);
      } catch (error) {
        console.error('获取文章错误:', error);
        setError(error instanceof Error ? error.message : t('blog.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory, t]); // 当选择的分类变化时重新获取

  // 处理分类点击
  const handleCategoryClick = (displayCategory: string) => {
    const backendCategory = categoryMapping[displayCategory];
    
    if (displayCategory === t('common.all')) {
      setSelectedCategory(null);
      setSelectedDisplayCategory(null);
    } else {
      // 如果当前选中的是同一个分类，则取消选择
      if (selectedDisplayCategory === displayCategory) {
        setSelectedCategory(null);
        setSelectedDisplayCategory(null);
      } else {
        setSelectedCategory(backendCategory);
        setSelectedDisplayCategory(displayCategory);
      }
    }
  };

  // 获取封面图片URL（Supabase Storage public URL）
  const getCoverImage = (article: Article) => {
    if (!article.cover_image_url) return '/images/default-image.svg';
    return article.cover_image_url;
  };

  // 图片状态管理
  const [imageSources] = useState<Record<string, string>>({});



  // 获取文章的显示图片URL
  const getArticleImageSrc = useCallback((article: Article) => {
    return imageSources[article.id] || getCoverImage(article);
  }, [imageSources]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#FF6F61]/20 border-t-[#FF6F61] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-20">
      {/* Hero Section */}
      <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6F61]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#ffb347]/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            {t('home.hero.title').split(t('home.hero.easternWisdom')).map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="text-[#FF6F61]">{t('home.hero.easternWisdom')}</span>}
              </span>
            ))}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            {t('home.hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Filter Bar - Modern Sliding Design */}
      <div className="sticky top-[72px] md:top-[88px] z-20 bg-[#faf9f6]/80 backdrop-blur-xl py-4 mb-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Category Sliding Area */}
            <div className="relative flex-1 w-full md:w-auto overflow-hidden group">
              {/* Left Gradient & Button */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#faf9f6] to-transparent z-10 pointer-events-none transition-opacity duration-300 flex items-center ${showLeftBlur ? 'opacity-100' : 'opacity-0'}`}
              >
                <button 
                  onClick={() => scrollByAmount(-200)}
                  className="pointer-events-auto ml-1 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-[#FF6F61] hover:text-white transition-all active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              </div>

              {/* Scrollable Container */}
              <div 
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onScroll={handleScroll}
                className={`flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 px-1 cursor-grab active:cursor-grabbing select-none ${isDragging ? 'scroll-auto' : 'scroll-smooth'}`}
              >
                <div className="flex items-center gap-3 flex-nowrap min-w-max">
                  {categories.map((category) => {
                    const isActive = (category === t('common.all') && selectedDisplayCategory === null) || selectedDisplayCategory === category;
                    return (
                      <button
                        key={category}
                        onMouseUp={(e) => handleCategoryClickWithDrag(e, category)}
                        className={`shrink-0 px-6 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 ${
                          isActive 
                          ? 'bg-[#FF6F61] text-white shadow-[0_8px_20px_-6px_rgba(255,111,97,0.45)] scale-105' 
                          : 'bg-white text-gray-500 border border-gray-100 hover:border-[#FF6F61]/30 hover:text-[#FF6F61] active:scale-95'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                  
                  <div className="w-px h-6 bg-gray-200 shrink-0 mx-1" />
                  
                  <Link
                    href="/services"
                    onMouseUp={(e) => {
                      if (hasMoved) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    className="shrink-0 px-6 py-2.5 rounded-2xl bg-[#ffb347]/10 text-[#ffb347] border border-[#ffb347]/20 font-black text-sm hover:bg-[#ffb347] hover:text-white transition-all duration-300"
                  >
                    {t('nav.services')} →
                  </Link>
                </div>
              </div>

              {/* Right Gradient & Button */}
              <div 
                className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#faf9f6] to-transparent z-10 pointer-events-none transition-opacity duration-300 flex items-center justify-end ${showRightBlur ? 'opacity-100' : 'opacity-0'}`}
              >
                <button 
                  onClick={() => scrollByAmount(200)}
                  className="pointer-events-auto mr-1 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-[#FF6F61] hover:text-white transition-all active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="shrink-0 w-full md:w-auto">
              <div className="relative group min-w-[160px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'likes' | 'bookmarks')}
                  className="appearance-none w-full bg-white text-gray-700 font-bold border border-gray-100 rounded-2xl pl-6 pr-12 py-2.5 text-sm focus:outline-none focus:border-[#FF6F61] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <option value="date">{t('sort.byDate')}</option>
                  <option value="likes">{t('sort.byLikes')}</option>
                  <option value="bookmarks">{t('sort.byBookmarks')}</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 bg-[#FF6F61] rounded-full" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-gray-200 rounded-3xl mb-4" />
                <div className="h-4 bg-gray-200 rounded-full w-24 mb-3" />
                <div className="h-6 bg-gray-200 rounded-full w-full mb-2" />
                <div className="h-6 bg-gray-200 rounded-full w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center font-bold">
            {t('blog.error')}: {error}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 text-xl font-medium">{t('blog.noArticles')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {articles
              .slice()
              .sort((a, b) => {
                if (sortBy === 'date') {
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                return 0;
              })
              .map((article, index) => (
                <Link
                  href={`/blog/${article.id}`}
                  key={article.id}
                  className="group block"
                >
                  <div className="relative aspect-[16/10] rounded-[32px] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    <div 
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                      style={{
                        transformOrigin: article.cover_image_pos ? `${article.cover_image_pos.x}% ${article.cover_image_pos.y}%` : 'center',
                        transform: article.cover_image_pos ? `scale(${article.cover_image_pos.zoom})` : undefined
                      }}
                    >
                      <Image
                        src={getArticleImageSrc(article)}
                        alt={article.title}
                        fill
                        priority={index < 3}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {article.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-black text-[#FF6F61] shadow-sm uppercase tracking-wider">
                          {t(`blog.category.${article.category.toLowerCase()}`) !== `blog.category.${article.category.toLowerCase()}` 
                            ? t(`blog.category.${article.category.toLowerCase()}`) 
                            : article.category}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 px-2">
                    <h2 className="text-2xl font-black text-gray-900 group-hover:text-[#FF6F61] transition-colors line-clamp-2 leading-[1.3] tracking-tight">
                      {article.title}
                    </h2>
                    <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed font-medium">
                      {article.summary || article.content_html.replace(/<[^>]*>/g, '').slice(0, 100)}
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0 bg-gray-100">
                        <Image
                          src={
                            (article.author_display_name === 'Rollkey' || article.author_display_name === '旭通' || !article.author_display_name)
                              ? '/admin_img.jpg'
                              : (article.author_avatar_url || '/user_img.png')
                          }
                          alt={article.author_display_name || 'Author'}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 leading-none">
                          {article.author_display_name || 'Rollkey'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {formatDate(article.created_at, t('common.locale') || 'en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
