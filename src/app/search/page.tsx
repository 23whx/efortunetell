'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Bookmark, MessageSquare } from "lucide-react";
import { getImageUrl } from '@/config/api';
import { getDisplayName, getAvatarPath } from '@/utils/avatar';
import { formatDate } from '@/utils/date';

// 文章接口定义
interface Article {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  bookmarks: number;
  commentsCount: number;
  coverImage: string;
  isPaid: boolean;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error(`搜索失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setArticles(data.data);
        } else {
          setArticles([]);
          if (!data.success) {
            setError(data.message || '未能获取搜索结果');
          }
        }
      } catch (error) {
        console.error('搜索错误:', error);
        setError(error instanceof Error ? error.message : '搜索失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // 获取封面图片URL，使用统一的 getImageUrl 函数
  const getCoverImage = (article: Article) => {
    if (!article.coverImage || article.coverImage === 'default-cover.jpg' || article.coverImage === '/default-cover.jpg') {
      return '/images/default-image.svg';
    }
    if (article.coverImage.startsWith('blob:')) return '/images/default-image.svg';
    
    // 使用统一的图片URL处理函数
    return getImageUrl(article.coverImage);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#FF6F61]">搜索结果: {query}</h1>
      
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded text-center my-10">
          搜索失败：{error}
        </div>
      )}
      
      {!loading && !error && articles.length === 0 && (
        <div className="text-center text-gray-500 py-20">
          <p className="text-gray-500 text-lg">
            没有找到包含 &ldquo;{query}&rdquo; 的文章
          </p>
        </div>
      )}
      
      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map((article) => (
            <Link
              href={`/blog/${article._id}`}
              key={article._id}
              className="block bg-[#FFFACD] text-[hsl(0_0%_14.5%)] rounded-lg overflow-hidden hover:shadow-md hover:shadow-[#FF6F61]/20 transition-all duration-300 h-64 flex flex-col border border-[#FF6F61]"
            >
              <div className="h-20 relative">
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
              <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs font-medium text-[#FF6F61]">{article.category}</span>
                <h2 className="text-lg font-semibold mt-1 mb-2 line-clamp-2">{article.title}</h2>
                <p className="text-[hsl(0_0%_55.6%)] text-sm mb-3 line-clamp-2 flex-grow">{article.summary}</p>

                <div className="flex justify-between items-center text-xs text-[#FF6F61] mt-auto pt-2 border-t border-[#FF6F61]">
                  <div className="flex items-center space-x-2 truncate mr-2">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden">
                      <Image
                        src={getAvatarPath(article.author)}
                        alt="作者头像"
                        width={20}
                        height={20}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    </div>
                    <span className="truncate">
                      {getDisplayName(article.author)} · {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{article.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{article.bookmarks || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{article.commentsCount || 0}</span>
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
    <div className="min-h-screen font-sans bg-[#FFFACD] pt-24">
      <Suspense fallback={
        <div className="container mx-auto px-6 py-8">
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