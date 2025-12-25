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
    [t('category.plumFortune')]: '梅花易数',
    [t('category.discussion')]: '杂谈',
    [t('category.other')]: '其他'
  };
  
  const categories = [
    t('common.all'), 
    t('service.bazi'), 
    t('service.liuren'), 
    t('service.qimen'), 
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
          .select('id,title,slug,summary,content_html,category,tags,cover_image_url,created_at,author_id')
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
      <div className="min-h-screen font-sans bg-[#FFFACD] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-[#FFFACD]">
      {/* Categories and Sort */}
      <div className="sticky top-16 md:top-20 z-10 bg-[#FFFACD] py-3 md:py-4 px-4 md:px-6 border-b border-gray-200">
        <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
          {/* 分类按钮 - 移动端滚动，桌面端正常显示 */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 md:gap-4 pb-2 md:pb-0 min-w-max">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="custom"
                  className={`shrink-0 rounded-lg font-medium px-3 py-2 md:px-4 text-sm md:text-base border border-[#FF6F61] text-[#FF6F61] hover:shadow-lg transition-all ${(category === t('common.all') && selectedDisplayCategory === null) || selectedDisplayCategory === category ? 'bg-[#FF6F61] text-white' : 'bg-transparent'}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* 排序选择器 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'likes' | 'bookmarks')}
            className="bg-[#FFFACD] text-[#FF6F61] border border-[#FF6F61] rounded px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-[#FF6F61] hover:bg-[#ffede3] transition-colors shrink-0"
          >
            <option value="date">{t('sort.byDate')}</option>
            <option value="likes">{t('sort.byLikes')}</option>
            <option value="bookmarks">{t('sort.byBookmarks')}</option>
          </select>
        </div>
      </div>

      {/* Articles */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded text-center my-10">
            {t('blog.error')}: {error}
          </div>
        )}

        {!loading && !error && setupHint && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded my-6">
            {setupHint}
          </div>
        )}
        
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t('blog.noArticles')}</p>
          </div>
        )}
        
        {!loading && !error && articles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {articles
              .slice()
              .sort((a, b) => {
                if (sortBy === 'date') {
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                } else if (sortBy === 'likes') {
                  return 0;
                } else {
                  return 0;
                }
              })
              .map((article, index) => (
                <Link
                  href={`/blog/${article.id}`}
                  key={article.id}
                  className="block bg-[#FFFACD] text-[hsl(0_0%_14.5%)] rounded-lg overflow-hidden hover:shadow-md hover:shadow-[#FF6F61]/20 transition-all duration-300 min-h-[280px] md:h-64 flex flex-col border border-[#FF6F61]"
                >
                  <div className="h-24 md:h-20 relative">
                    <Image
                      src={getArticleImageSrc(article)}
                      alt={article.title}
                      fill
                      priority={index < 6}
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-image.svg';
                        target.alt = '图片加载失败';
                      }}
                      unoptimized={true}
                    />
                  </div>
                  <div className="p-3 md:p-4 flex flex-col flex-grow">
                    <span className="text-xs font-medium text-[#FF6F61]">{article.category || ''}</span>
                    <h2 className="text-base md:text-lg font-semibold mt-1 mb-2 line-clamp-2">{article.title}</h2>
                    <p className="text-[hsl(0_0%_55.6%)] text-sm mb-3 line-clamp-2 md:line-clamp-2 flex-grow">{article.summary || ''}</p>

                    <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center text-xs text-[#FF6F61] mt-auto pt-2 border-t border-[#FF6F61]">
                      <div className="flex items-center space-x-2 truncate">
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full flex-shrink-0 overflow-hidden">
                          <Image
                            src="/user_img.png"
                            alt="Author avatar"
                            width={20}
                            height={20}
                            className="w-full h-full object-cover"
                            unoptimized={true}
                          />
                        </div>
                        <span className="truncate text-xs md:text-sm">
                          {article.author_display_name || 'Rollkey'} · {formatDate(article.created_at)}
                        </span>
                      </div>
                      <div className="flex gap-3 shrink-0 justify-start md:justify-end">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span className="text-xs">发布</span>
                        </div>
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
