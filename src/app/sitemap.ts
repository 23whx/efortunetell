import { MetadataRoute } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { locales, defaultLocale, withLocale } from '@/lib/i18n/config';
import { buildLanguageAlternates } from '@/lib/i18n/seo';
import { todayDateKey, shiftDateKey } from '@/lib/paipan/almanac';
import { articleContentLocale, articlePath } from '@/lib/blog/locale';
import { PILLARS } from '@/lib/seo/pillars';
import { SITE_URL } from '@/lib/site';
import { TERM_CATEGORIES, termPath, type TermCategory } from '@/lib/glossary';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const baseUrl = SITE_URL;

function localized(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${baseUrl}${withLocale(locale, path)}`,
    lastModified: new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: {
      languages: buildLanguageAlternates(path),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    { path: '/', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/tools', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/tools/almanac', changeFrequency: 'daily' as const, priority: 0.95 },
    { path: '/tools/bazi', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/tools/qimen', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/tools/daliuren', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/tools/naming', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/services', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/fortune', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
    ...PILLARS.map((p) => ({ path: `/services/${p.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];

  const staticPages = staticPaths.flatMap((p) =>
    localized(p.path, { changeFrequency: p.changeFrequency, priority: p.priority })
  );

  // Chinese terms library (zh only; other locales redirect to /zh)
  const termPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/zh/terms`, lastModified: new Date('2026-10-14'), changeFrequency: 'monthly', priority: 0.8 },
    ...(Object.keys(TERM_CATEGORIES) as TermCategory[]).flatMap((c) =>
      TERM_CATEGORIES[c].names.map((n) => ({
        url: `${baseUrl}/zh${termPath(c, n)}`,
        lastModified: new Date('2026-10-14'),
        changeFrequency: (c === 'jieqi' ? 'yearly' : 'monthly') as 'yearly' | 'monthly',
        priority: 0.6,
      }))
    ),
  ];

  // About + privacy are written in zh + en only (ja/ko/ar canonicalize to /en/...)
  const privacyPages: MetadataRoute.Sitemap = (['/about', '/privacy'] as const).flatMap((path) =>
    (['en', 'zh'] as const).map((locale) => ({
      url: `${baseUrl}${withLocale(locale, path)}`,
      lastModified: new Date('2026-10-14'),
      changeFrequency: 'yearly' as const,
      priority: path === '/about' ? 0.6 : 0.3,
    }))
  );

  // Near-term almanac day pages (SEO long-tail) — default locale + zh
  const almanacDays: MetadataRoute.Sitemap = [];
  const today = todayDateKey();
  for (let i = -7; i <= 30; i++) {
    const date = shiftDateKey(today, i);
    for (const locale of [defaultLocale, 'zh'] as const) {
      almanacDays.push({
        url: `${baseUrl}${withLocale(locale, `/tools/almanac/${date}`)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, updated_at, created_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (!error && Array.isArray(data)) {
      // One URL per article: the canonical content-language URL (other locales canonicalize to it)
      articlePages = data.map((article) => ({
        url: `${baseUrl}${withLocale(articleContentLocale(article.title), articlePath(article))}`,
        lastModified: new Date(article.updated_at || article.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
    } else if (error) {
      console.error('[sitemap] Failed to fetch articles:', error);
    }
  } catch (err) {
    console.error('[sitemap] Exception while fetching articles:', err);
  }

  return [...staticPages, ...privacyPages, ...termPages, ...almanacDays, ...articlePages];
}
