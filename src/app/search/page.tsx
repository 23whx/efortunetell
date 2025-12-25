'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from "lucide-react";
import { formatDate } from '@/utils/date';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

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
            setSetupHint('Supabase 还没建表：请先在 Supabase SQL Editor 执行项目里的 supabase/schema.sql');
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
        setError(error instanceof Error ? error.message : '搜索失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // 获取封面图片URL（Supabase Storage public URL）
  const getCoverImage = (article: Article) => {
    return article.cover_image_url || '/images/default-image.svg';
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#FF6F61]">搜索结果: {query}</h1>
      
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded text-center my-6 md:my-10">
          搜索失败：{error}
        </div>
      )}

      {!loading && !error && setupHint && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-center my-6 md:my-10">
          {setupHint}
        </div>
      )}
      
      {!loading && !error && articles.length === 0 && (
        <div className="text-center text-gray-500 py-12 md:py-20">
          <p className="text-gray-500 text-base md:text-lg px-4">
            没有找到包含 &ldquo;{query}&rdquo; 的文章
          </p>
        </div>
      )}
      
      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {articles.map((article) => (
            <Link
              href={`/blog/${article.id}`}
              key={article.id}
              className="block bg-[#FFFACD] text-[hsl(0_0%_14.5%)] rounded-lg overflow-hidden hover:shadow-md hover:shadow-[#FF6F61]/20 transition-all duration-300 min-h-[280px] md:h-64 flex flex-col border border-[#FF6F61]"
            >
              <div className="h-24 md:h-20 relative">
                <Image
                  src={getCoverImage(article)}
                  alt={article.title}
                  fill
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
                <p className="text-[hsl(0_0%_55.6%)] text-sm mb-3 line-clamp-2 flex-grow">{article.summary}</p>

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
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen font-sans bg-[#FFFACD]">
      <Suspense fallback={
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
} 