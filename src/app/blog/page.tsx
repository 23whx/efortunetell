'use client';
import { useState, useEffect, useCallback } from 'react';
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
    [t('service.bazi')]: '八字',
    [t('service.liuren')]: '大六壬', 
    [t('service.qimen')]: '阴盘奇门',
    [t('service.naming')]: '起名',
    ['风水']: '风水',
    [t('category.plumFortune')]: '梅花易数',
    [t('category.discussion')]: '杂谈',
    [t('category.other')]: '其他'
  };
  
  const categories = [
    t('common.all'), 
    t('service.bazi'), 
    t('service.liuren'), 
    t('service.qimen'), 
    '风水',
    t('service.naming'),
    t('category.plumFortune'),
    t('category.discussion'), 
    t('category.other')
  ];
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDisplayCategory, setSelectedDisplayCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'likes' | 'bookmarks'>('date');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
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
          .limit(100);

        if (selectedCategory) {
          q = q.eq('category', selectedCategory);
        }
        
        const { data, error: qErr } = await q;
        if (qErr) {
          // Common fresh-project case: schema not applied yet.
          // PGRST205: table not found in schema cache.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const code = (qErr as any)?.code;
          if (code === 'PGRST205') {
            setSetupHint('Supabase 还没建表：请先在 Supabase SQL Editor 执行项目里的 supabase/schema.sql');
            setArticles([]);
            return;
          }
          throw qErr;
        }

        const authorIds = Array.from(new Set((data || []).map((a) => a.author_id).filter(Boolean)));
        const authorMap = new Map<string, string>();

        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id,display_name')
            .in('id', authorIds);

          (profiles || []).forEach((p) => authorMap.set(p.id, p.display_name || ''));
        }

        const mapped: Article[] = (data || []).map((a) => ({
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
          author_display_name: authorMap.get(a.author_id) || null,
        }));

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
            探索 <span className="text-[#FF6F61]">东方智慧</span> <br className="hidden md:block" /> 与命运的奥秘
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            在这里，我们研习八字、奇门、六壬，<br className="md:hidden" /> 以古人之智，启今日之程。
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[72px] md:top-[88px] z-20 bg-[#faf9f6]/80 backdrop-blur-xl border-y border-gray-100 py-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            {categories.map((category) => {
              const isActive = (category === t('common.all') && selectedDisplayCategory === null) || selectedDisplayCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    isActive 
                    ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-[#FF6F61]/30 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
          
          <div className="relative group min-w-[140px] w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'likes' | 'bookmarks')}
              className="appearance-none w-full bg-white text-gray-700 font-bold border border-gray-100 rounded-full px-6 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/20 cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <option value="date">{t('sort.byDate')}</option>
              <option value="likes">{t('sort.byLikes')}</option>
              <option value="bookmarks">{t('sort.byBookmarks')}</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-1 h-1 bg-gray-400 rounded-full mb-0.5" />
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
            </div>
          </div>

          <div className="w-full md:w-auto flex justify-end">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-100 text-gray-600 font-bold text-sm hover:border-[#FF6F61]/30 hover:text-[#FF6F61] transition-all"
            >
              专题入口 →
            </Link>
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
                          {article.category}
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
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                        <Image
                          src="/user_img.png"
                          alt="Author"
                          width={32}
                          height={32}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 leading-none">
                          {article.author_display_name || 'Rollkey'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {formatDate(article.created_at)}
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
