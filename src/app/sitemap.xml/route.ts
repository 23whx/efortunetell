import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  /* 收集站点重要 URL，包括静态页面和已发布文章 */
  const baseUrl = 'https://efortunetell.blog';

  // 静态页面
  const staticPaths = [
    '/',
    '/blog',
    '/services',
    '/services/bazi',
    '/services/qimen-yinpan',
    '/services/daliuren',
    '/services/fengshui',
    '/services/naming',
    '/contact',
    '/fortune',
  ];
  const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = staticPaths.map((p) => ({
    loc: `${baseUrl}${p}`,
    changefreq: 'weekly',
    priority: p === '/' ? '1.0' : '0.8',
  }));

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id,updated_at,created_at')
      .eq('status', 'published')
      .limit(1000);

    if (!error && Array.isArray(data)) {
      data.forEach((a: { id: string; updated_at?: string; created_at?: string }) => {
        urls.push({
          loc: `${baseUrl}/blog/${a.id}`,
          lastmod: (a.updated_at || a.created_at || new Date().toISOString()).slice(0, 10),
          changefreq: 'monthly',
          priority: '0.7',
        });
      });
    }
  } catch (err) {
    console.error('[sitemap] Failed to fetch articles:', err);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => {
        const parts = [
          `  <url>`,
          `    <loc>${u.loc}</loc>`,
          u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
          u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : null,
          u.priority ? `    <priority>${u.priority}</priority>` : null,
          `  </url>`,
        ].filter(Boolean);
        return parts.join('\n');
      })
      .join('\n') +
    '\n</urlset>';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 