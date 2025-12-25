import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  /* 收集站点重要 URL，包括静态页面和已发布文章 */
  const baseUrl = 'https://efortunetell.blog';

  // 静态页面
  const staticPaths = ['/', '/contact', '/fortune'];
  let dynamicPaths: string[] = [];

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .eq('status', 'published')
      .limit(1000);

    if (!error && Array.isArray(data)) {
      dynamicPaths = data.map((a: { id: string }) => `/blog/${a.id}`);
    }
  } catch (err) {
    console.error('[sitemap] Failed to fetch articles:', err);
  }

  const allUrls = [...staticPaths, ...dynamicPaths];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    allUrls
      .map((path) => {
        return `  <url>\n    <loc>${baseUrl}${path}</loc>\n  </url>`;
      })
      .join('\n') +
    '\n</urlset>';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 