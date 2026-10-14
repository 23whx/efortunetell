import { notFound, permanentRedirect } from 'next/navigation';
import { cache } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogDetails, { BlogArticle } from '@/components/blog/BlogDetails';
import Comments from '@/components/blog/Comments';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getServerT } from '@/lib/i18n/server';
import { isLocale, localeHtmlLang, type Locale } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/i18n/seo';
import { articleContentLocale as contentLocale, articlePath } from '@/lib/blog/locale';
import { AUTHOR_ID, AUTHOR_NAME, OG_IMAGES, ORG_ID, SITE_NAME, SITE_URL, WEBSITE_ID, isSiteAuthor as isOwnAuthor, jsonLd } from '@/lib/site';

interface BlogDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The route segment is the article slug (canonical) or, for old links, its UUID. */
const getArticleRow = cache(async (param: string) => {
  let key = param;
  try {
    key = decodeURIComponent(param);
  } catch {}
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id,slug,title,summary,content_html,category,tags,cover_image_url,created_at,updated_at,author_id')
    .eq(UUID_RE.test(key) ? 'id' : 'slug', key)
    .maybeSingle();
  if (error) throw error;
  return { row: data, byId: UUID_RE.test(key) };
});

function plainText(html: string | null | undefined): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function excerpt(html: string | null | undefined, max = 155): string {
  const text = plainText(html);
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// 生成页面元数据
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const { t } = await getServerT(isLocale(locale) ? locale : undefined);
  try {
    const { row: article } = await getArticleRow(id);

    if (article) {
      const canonicalUrl = absoluteUrl(contentLocale(article.title), articlePath(article));
      const description = article.summary || excerpt(article.content_html) || article.title;
      const image = article.cover_image_url
        ? { url: article.cover_image_url, alt: article.title }
        : { url: OG_IMAGES.default, width: 1200, height: 630, alt: article.title };

      return {
        title: article.title,
        description,
        keywords: article.tags || [],
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title: article.title,
          description,
          url: canonicalUrl,
          siteName: SITE_NAME,
          type: 'article',
          publishedTime: article.created_at,
          modifiedTime: article.updated_at || article.created_at,
          authors: [AUTHOR_NAME],
          section: article.category || undefined,
          tags: article.tags || [],
          images: [image],
        },
        robots: {
          index: true,
          follow: true,
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description,
          images: [image.url],
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
  const { locale, id } = await params;
  const { t } = await getServerT(isLocale(locale) ? locale : undefined);
  
  if (!id) return notFound();

  let article: BlogArticle | null = null;
  let articleSlug: string | null = null;
  let error: string | null = null;
  let redirectTo: string | null = null;
  
  try {
    const { row, byId } = await getArticleRow(id);
    if (!row) return notFound();
    // Old UUID links → permanent redirect to the readable slug URL
    if (byId && row.slug) redirectTo = `/${locale}${articlePath(row)}`;
    articleSlug = row.slug;

    const supabase = await createSupabaseServerClient();

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
  // Outside try/catch: permanentRedirect works by throwing
  if (redirectTo) permanentRedirect(redirectTo);
  
  // Build structured data for the article (JSON-LD), rendered into the server HTML
  const lang = article ? contentLocale(article.title) : 'zh';
  const articleUrl = absoluteUrl(lang, articlePath({ slug: articleSlug, id: article?.id ?? id }));
  const uiLocale: Locale = isLocale(locale) ? locale : 'en';
  const authorName = article?.author_display_name;
  const isSiteAuthor = isOwnAuthor(authorName);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${articleUrl}#article`,
        headline: article?.title,
        description: article?.summary || excerpt(article?.content_html),
        image: [article?.cover_image_url || `${SITE_URL}${OG_IMAGES.default}`],
        author: isSiteAuthor ? { '@id': AUTHOR_ID } : { '@type': 'Person', name: authorName },
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': WEBSITE_ID },
        datePublished: article?.created_at,
        // prefer updated_at when present
        dateModified: (article as any)?.updated_at ?? article?.created_at,
        inLanguage: localeHtmlLang[lang],
        articleSection: article?.category || undefined,
        keywords: article?.tags?.length ? article.tags.join(', ') : undefined,
        mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${articleUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('common.blog'), item: absoluteUrl(uiLocale, '/') },
          { '@type': 'ListItem', position: 2, name: article?.title, item: articleUrl },
        ],
      },
    ],
  };

  return (
    <>
      {/* Structured data for SEO (only when article exists) */}
      {article && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      )}

      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto">
          <Link 
            href={`/${uiLocale}`} 
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
