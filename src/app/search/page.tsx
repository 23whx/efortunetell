'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from "lucide-react";
import { formatDate } from '@/utils/date';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';

// 文章接口定义
interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content_html: string;
  category: string | null;
  tags: string[];
  cover_image_url: string | null;
  created_at: string;
  author_display_name: string | null;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t } = useLanguage();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupHint, setSetupHint] = useState<string | null>(null);
  
  // 加载搜索结果
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setArticles([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        setSetupHint(null);

        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('articles')
          .select('id,title,slug,summary,content_html,category,tags,cover_image_url,created_at,author_id')
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content_html.ilike.%${query}%`)
          .limit(50);
        if (error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const code = (error as any)?.code;
          if (code === 'PGRST205') {
            setSetupHint(t('blog.setupHint'));
            setArticles([]);
            return;
          }
          throw error;
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
          summary: a.summary || '',
          content_html: a.content_html,
          category: a.category,
          tags: a.tags || [],
          cover_image_url: a.cover_image_url,
          created_at: a.created_at,
          author_display_name: authorMap.get(a.author_id) || null,
        }));

        setArticles(mapped);
      } catch (error) {
        console.error('搜索错误:', error);
        setError(error instanceof Error ? error.message : t('search.failed'));
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, t]);

  // 获取封面图片URL（Supabase Storage public URL）
  const getCoverImage = (article: Article) => {
    return article.cover_image_url || '/images/default-image.svg';
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#FF6F61]">{t('search.results')}: {query}</h1>
      
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded text-center my-6 md:my-10 font-bold">
          {t('search.failed')}: {error}
        </div>
      )}

      {!loading && !error && setupHint && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-center my-6 md:my-10 font-medium">
          {setupHint}
        </div>
      )}
      
      {!loading && !error && articles.length === 0 && (
        <div className="text-center text-gray-500 py-12 md:py-20 bg-white/50 rounded-3xl border border-dashed border-gray-200 mx-4">
          <p className="text-gray-500 text-base md:text-lg px-4 font-medium">
            {t('search.noArticlesFound').replace('{query}', query)}
          </p>
        </div>
      )}
      
      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              href={`/blog/${article.id}`}
              key={article.id}
              className="group block bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 border border-gray-100"
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <Image
                  src={getCoverImage(article)}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-image.svg';
                  }}
                  unoptimized={true}
                />
                {article.category && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black text-[#FF6F61] shadow-sm uppercase tracking-wider">
                      {t(`blog.category.${article.category.toLowerCase()}`) !== `blog.category.${article.category.toLowerCase()}` 
                        ? t(`blog.category.${article.category.toLowerCase()}`) 
                        : article.category}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col h-[180px]">
                <h2 className="text-lg font-black text-gray-900 group-hover:text-[#FF6F61] transition-colors line-clamp-2 mb-2 leading-tight">
                  {article.title}
                </h2>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
                  {article.summary}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-100">
                      <Image
                        src={
                          (article.author_display_name === 'Rollkey' || article.author_display_name === '旭通' || !article.author_display_name)
                            ? '/admin_img.jpg'
                            : '/user_img.png'
                        }
                        alt="Author"
                        width={24}
                        height={24}
                        className="object-cover"
                        unoptimized={true}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">
                      {article.author_display_name || 'Rollkey'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(article.created_at, t('common.locale') || 'en-US')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Suspense fallback={
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF6F61]/20 border-t-[#FF6F61] rounded-full animate-spin"></div>
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
