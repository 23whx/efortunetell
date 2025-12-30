import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogDetails, { BlogArticle } from '@/components/blog/BlogDetails';
import Comments from '@/components/blog/Comments';
import { Metadata } from 'next';
import Script from 'next/script';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getServerT } from '@/lib/i18n/server';

interface BlogDetailPageProps {
  params: Promise<{ id: string }>
}

// 生成页面元数据
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { t } = await getServerT();
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: article } = await supabase
      .from('articles')
      .select('id,title,summary,tags,cover_image_url,created_at,updated_at')
      .eq('id', id)
      .maybeSingle();

    if (article) {
      const baseUrl = 'https://efortunetell.blog';
      const canonicalUrl = `${baseUrl}/blog/${article.id}`;
      const imageUrl = article.cover_image_url || undefined;

      return {
        title: article.title,
        description: article.summary || `Read the article about ${article.title}`,
        keywords: article.tags || [],
        alternates: {
          canonical: canonicalUrl,
          languages: {
            'en-US': canonicalUrl,
            'zh-CN': `${canonicalUrl}?lang=zh`,
          },
        },
        openGraph: {
          title: article.title,
          description: article.summary || '',
          url: canonicalUrl,
          type: 'article',
          images: imageUrl ? [{ url: imageUrl }] : [],
        },
        robots: {
          index: true,
          follow: true,
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: article.summary || '',
          images: imageUrl ? [imageUrl] : [],
        },
      };
    }
    
    return {
      title: t('common.blog'),
      description: t('home.description')
    };
  } catch {
    return {
      title: t('common.blog'),
      description: t('home.description')
    };
  }
}

// 服务器组件，用于获取数据
export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const { t } = await getServerT();
  
  if (!id) return notFound();

  let article: BlogArticle | null = null;
  let error: string | null = null;
  
  try {
    const supabase = await createSupabaseServerClient();

    const { data: row, error: fetchError } = await supabase
      .from('articles')
      .select('id,title,summary,content_html,category,tags,cover_image_url,created_at,updated_at,author_id')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!row) return notFound();

    const { data: author } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', row.author_id)
      .maybeSingle();

    article = {
      id: row.id,
      title: row.title,
      summary: row.summary,
      content_html: row.content_html,
      category: row.category,
      tags: row.tags || [],
      cover_image_url: row.cover_image_url,
      created_at: row.created_at,
      // @ts-expect-error: BlogArticle may not include updated_at; used only for SEO
      updated_at: row.updated_at,
      author_display_name: author?.display_name ?? null,
    };
  } catch (err) {
    console.error('Error fetching article details:', err);
    error = err instanceof Error ? err.message : t('blog.error');
  }
  
  // Build structured data for the article (JSON-LD)
  const baseUrl = 'https://efortunetell.blog';
  const articleUrl = `${baseUrl}/blog/${article?.id}`;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      article?.title ? { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl } : null,
    ].filter(Boolean),
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article?.title,
    description: article?.summary,
    image: article?.cover_image_url ? [article.cover_image_url] : undefined,
    author: {
      '@type': 'Person',
      name: article?.author_display_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Rolley Divination Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.png`,
      },
    },
    datePublished: article?.created_at,
    // prefer updated_at when present
    dateModified: (article as any)?.updated_at ?? article?.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };

  return (
    <>
      {/* Structured data for SEO */}
      <Script id="breadcrumb-ld-json" type="application/ld+json">
        {JSON.stringify(breadcrumbLd)}
      </Script>
      <Script id="article-ld-json" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center hover:text-[#ff8a75] mb-6 px-6 pt-6 transition-colors"
            style={{ color: '#ff6f61' }}
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">{t('blog.backToList')}</span>
          </Link>
          
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mx-6 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{t('blog.error')}</h3>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : !article ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">{t('blog.loading')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* 将文章数据传递给客户端组件 */}
              <BlogDetails article={article} />
              
              {/* 评论区 */}
              <Comments articleId={article.id} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
