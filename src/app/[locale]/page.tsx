import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, localeHtmlLang } from '@/lib/i18n/config';
import { SITE_COPY, absoluteUrl, buildPageMetadata } from '@/lib/i18n/seo';
import { getPublishedArticles } from '@/lib/blog/list';
import BlogList from '@/components/blog/BlogList';
import { WEBSITE_ID, jsonLd } from '@/lib/site';

// 直接将博客列表作为首页；文章列表在服务端渲染并每 10 分钟增量更新
export const revalidate = 600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const copy = SITE_COPY[raw];
  return buildPageMetadata({
    locale: raw,
    path: '/',
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    absoluteTitle: true,
  });
}

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const articles = await getPublishedArticles();

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(raw, '/')}#webpage`,
    url: absoluteUrl(raw, '/'),
    name: SITE_COPY[raw].title,
    description: SITE_COPY[raw].description,
    inLanguage: localeHtmlLang[raw],
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.slice(0, 30).map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl('zh', `/blog/${a.id}`),
        name: a.title,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <BlogList initialArticles={articles} />
    </>
  );
}
