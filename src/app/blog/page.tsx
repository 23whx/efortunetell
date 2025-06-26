'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Heart, Bookmark, MessageSquare } from "lucide-react";
import Button from '@/components/ui/button';
import { API_BASE_URL, getImageUrl } from '@/config/api';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
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
  coverSettings?: {
    scale: number;
    positionX: number;
    positionY: number;
  };
  isPaid: boolean;
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

  // 加载文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 构建查询参数
        const queryParams = new URLSearchParams({
          limit: '100', // 获取更多文章
          status: 'published' // 只获取已发布的文章
        });
        
        // 如果选择了分类，添加到查询参数
        if (selectedCategory) {
          queryParams.append('category', selectedCategory);
        }
        
        const response = await fetch(`${API_BASE_URL}/api/articles?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`${t('blog.error')}: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setArticles(data.data);
        } else {
          throw new Error(t('blog.error'));
        }
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

  // 获取封面图片URL，使用修复后的 getImageUrl 函数
  const getCoverImage = (article: Article) => {
    if (!article.coverImage || article.coverImage === 'default-cover.jpg' || article.coverImage === '/default-cover.jpg') {
      return '/images/default-image.svg';
    }
    if (article.coverImage.startsWith('blob:')) return '/images/default-image.svg';
    
    // 使用统一的图片URL处理函数
    return getImageUrl(article.coverImage);
  };

  // 图片状态管理
  const [imageSources] = useState<Record<string, string>>({});



  // 获取文章的显示图片URL
  const getArticleImageSrc = useCallback((article: Article) => {
    return imageSources[article._id] || getCoverImage(article);
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
      <div className="sticky top-0 z-10 bg-[#FFFACD] py-4 px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="custom"
                className={`shrink-0 rounded-lg font-medium px-4 py-2 border border-[#FF6F61] text-[#FF6F61] hover:shadow-lg transition-all ${(category === t('common.all') && selectedDisplayCategory === null) || selectedDisplayCategory === category ? 'bg-[#FF6F61] text-white' : 'bg-transparent'}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'likes' | 'bookmarks')}
            className="bg-[#FFFACD] text-[#FF6F61] border border-[#FF6F61] rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF6F61] hover:bg-[#ffede3] transition-colors"
          >
            <option value="date">{t('sort.byDate')}</option>
            <option value="likes">{t('sort.byLikes')}</option>
            <option value="bookmarks">{t('sort.byBookmarks')}</option>
          </select>
        </div>
      </div>

      {/* Articles */}
      <div className="container mx-auto px-6 py-8">
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
        
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">{t('blog.noArticles')}</p>
          </div>
        )}
        
        {!loading && !error && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles
              .slice()
              .sort((a, b) => {
                if (sortBy === 'date') {
                  return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
                } else if (sortBy === 'likes') {
                  return b.likes - a.likes;
                } else {
                  return b.bookmarks - a.bookmarks;
                }
              })
              .map((article, index) => (
                <Link
                  href={`/blog/${article._id}`}
                  key={article._id}
                  className="block bg-[#FFFACD] text-[hsl(0_0%_14.5%)] rounded-lg overflow-hidden hover:shadow-md hover:shadow-[#FF6F61]/20 transition-all duration-300 h-64 flex flex-col border border-[#FF6F61]"
                >
                  <div className="h-20 relative">
                    {article.coverSettings ? (
                      // 使用coverSettings的情况
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${getArticleImageSrc(article)})`,
                          backgroundSize: `${article.coverSettings.scale * 100}%`,
                          backgroundPosition: `${article.coverSettings.positionX}% ${article.coverSettings.positionY}%`,
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    ) : (
                      // 默认显示方式
                      <Image
                        src={getArticleImageSrc(article)}
                        alt={article.title}
                        fill
                        priority={index < 6} // 给前6篇文章添加优先级以改善LCP
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/default-image.svg';
                          target.alt = '图片加载失败';
                        }}
                        unoptimized={true}
                      />
                    )}
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
    </div>
  );
}
