import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function esc(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const baseUrl = 'https://efortunetell.blog';

  let items = '';
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from('articles')
      .select('id,title,summary,created_at,updated_at,cover_image_url')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    (data || []).forEach((a) => {
      const link = `${baseUrl}/blog/${a.id}`;
      const title = esc(a.title || 'Untitled');
      const desc = esc(a.summary || '');
      const pubDate = new Date(a.created_at || new Date().toISOString()).toUTCString();
      const guid = link;
      const enclosure = a.cover_image_url
        ? `<enclosure url="${esc(a.cover_image_url)}" type="image/*" />`
        : '';

      items +=
        `<item>` +
        `<title>${title}</title>` +
        `<link>${link}</link>` +
        `<guid isPermaLink="true">${guid}</guid>` +
        `<pubDate>${pubDate}</pubDate>` +
        (desc ? `<description>${desc}</description>` : '') +
        enclosure +
        `</item>`;
    });
  } catch (e) {
    console.error('[rss] Failed to build RSS:', e);
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0">` +
    `<channel>` +
    `<title>Rollkey Divination Blog</title>` +
    `<link>${baseUrl}</link>` +
    `<description>Chinese metaphysics: BaZi, Qi Men Dun Jia, Da Liu Ren, Zi Wei Dou Shu and more.</description>` +
    `<language>en</language>` +
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>` +
    items +
    `</channel>` +
    `</rss>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}


