'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Calendar, Share2, ArrowUp } from 'lucide-react';
import { formatDate } from '@/utils/date';
import ShareModal from '@/components/ui/ShareModal';
import { useLanguage } from '@/contexts/LanguageContext';

export type BlogArticle = {
  id: string;
  title: string;
  summary: string | null;
  content_html: string;
  category: string | null;
  tags: string[];
  cover_image_url: string | null;
  created_at: string;
  author_display_name: string | null;
};

export default function BlogDetails({ article }: { article: BlogArticle }) {
  const { t } = useLanguage();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const processedContent = useMemo(() => {
    // Keep content as-is; images should already be valid public URLs (Supabase Storage).
    return article.content_html || '';
  }, [article.content_html]);

  const coverImageUrl = article.cover_image_url || null;
  const authorName = article.author_display_name || 'Rollkey';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffacd' }}>
      <div className="max-w-4xl mx-auto bg-white shadow-sm">
        {coverImageUrl && (
          <div className="w-full h-80 relative overflow-hidden">
              <Image
                src={coverImageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
                unoptimized={true}
              />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        <div className="px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {article.category && (
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#fff5f4', color: '#ff6f61' }}>
                {t(`blog.category.${article.category.toLowerCase()}`) !== `blog.category.${article.category.toLowerCase()}` 
                  ? t(`blog.category.${article.category.toLowerCase()}`) 
                  : article.category}
              </span>
              )}
              {article.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {article.summary && (
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {article.summary}
              </p>
            )}

            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                    <Image
                      src={
                        (authorName === 'Rollkey' || authorName === '旭通' || authorName === null)
                          ? '/admin_img.jpg'
                          : '/user_img.png'
                      }
                      alt={t('blog.authorAvatar')}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {authorName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">
                    {formatDate(article.created_at, t('common.locale') || 'en-US')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>{t('blog.share')}</span>
              </button>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <style jsx>{`
              .article-content {
                color: #374151;
                line-height: 1.8;
                font-size: 16px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              }
              .article-content img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 20px 0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                display: block;
              }
            `}</style>
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </div>
        </div>
      </div>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity z-40"
          style={{ backgroundColor: '#ff6f61' }}
        >
          <ArrowUp className="w-6 h-6 mx-auto" />
        </button>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={article.title}
        summary={article.summary || ''}       
        url={typeof window !== 'undefined' ? window.location.href : ''}
        coverImage={coverImageUrl || undefined}
      />
    </div>
  );
} 
