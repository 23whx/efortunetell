import { API_BASE_URL } from '@/config/api';

export async function GET() {
  /* 收集站点重要 URL，包括静态页面和已发布文章 */
  const baseUrl = 'https://efortunetell.blog';

  // 静态页面
  const staticPaths = ['/', '/contact', '/fortune'];
  let dynamicPaths: string[] = [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/articles?status=published&limit=1000`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      dynamicPaths = data.data.map((a: { _id: string }) => `/blog/${a._id}`);
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