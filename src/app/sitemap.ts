import { MetadataRoute } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { locales, defaultLocale, withLocale } from '@/lib/i18n/config';
import { todayDateKey, shiftDateKey } from '@/lib/paipan/almanac';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const baseUrl = 'https://efortunetell.blog';

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
      languages: Object.fromEntries(
        locales.map((l) => [l === 'zh' ? 'zh-CN' : l, `${baseUrl}${withLocale(l, path)}`])
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    { path: '/', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/blog', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/tools', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/tools/almanac', changeFrequency: 'daily' as const, priority: 0.95 },
    { path: '/tools/bazi', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/tools/qimen', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/tools/daliuren', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/tools/naming', changeFrequency: 'weekly' as const, priority: 0.95 },
    { path: '/ai-chat', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/services', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/fortune', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/donation', changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  const staticPages = staticPaths.flatMap((p) =>
    localized(p.path, { changeFrequency: p.changeFrequency, priority: p.priority })
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
      .select('id, updated_at, created_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (!error && Array.isArray(data)) {
      articlePages = data.flatMap((article) =>
        locales.map((locale) => ({
          url: `${baseUrl}${withLocale(locale, `/blog/${article.id}`)}`,
          lastModified: new Date(article.updated_at || article.created_at),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      );
    } else if (error) {
      console.error('[sitemap] Failed to fetch articles:', error);
    }
  } catch (err) {
    console.error('[sitemap] Exception while fetching articles:', err);
  }

  return [...staticPages, ...almanacDays, ...articlePages];
}
