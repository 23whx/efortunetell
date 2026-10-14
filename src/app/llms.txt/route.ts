import { createSupabasePublicClient } from '@/lib/supabase/server';
import { articleContentLocale } from '@/lib/blog/locale';
import { PILLARS } from '@/lib/seo/pillars';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

/** https://llmstxt.org — a plain-Markdown map of the site for AI assistants and answer engines */
export async function GET() {
  let articles = '';
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from('articles')
      .select('id,title,summary,category')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(200);
    articles = (data || [])
      .map((a) => {
        const url = `${SITE_URL}/${articleContentLocale(a.title)}/blog/${a.id}`;
        const note = [a.category, a.summary].filter(Boolean).join(' — ');
        return `- [${a.title}](${url})${note ? `: ${note}` : ''}`;
      })
      .join('\n');
  } catch (e) {
    console.error('[llms.txt] Failed to load articles:', e);
  }

  const body = `# Rollkey Divination Blog (滚键Rollkey命理博客)

> Chinese metaphysics site by Rollkey (滚键): free online BaZi (Four Pillars of Destiny / 八字排盘), Yin Pan Qimen Dunjia (阴盘奇门遁甲), Da Liu Ren (大六壬) and Chinese almanac (万年历 / 老黄历) calculators, plus original Chinese-language articles on Ten Gods (十神), chart structures (格局), useful gods (用神), date selection (择日) and name selection (起名).

- Tools are free and compute in the browser; no sign-up needed.
- The UI is available in English (/en), Simplified Chinese (/zh), Japanese (/ja), Korean (/ko) and Arabic (/ar). Articles are written in Chinese; their canonical URLs are under /zh.
- Author: Rollkey — X/Twitter @Rollkey4, email wyh93829@gmail.com.

## Free tools
- [BaZi chart / 八字排盘](${SITE_URL}/zh/tools/bazi): four pillars, hidden stems, Ten Gods, Na Yin, void, luck cycles (大运) and solar terms.
- [Yin Pan Qimen Dunjia / 阴盘奇门排盘](${SITE_URL}/zh/tools/qimen): hour-based Qimen chart with palaces, doors, stars and deities.
- [Da Liu Ren / 大六壬起课](${SITE_URL}/zh/tools/daliuren): four lessons, three transmissions, heavenly generals.
- [Chinese almanac / 万年历·老黄历](${SITE_URL}/zh/tools/almanac): daily yi/ji (宜忌), clashes (冲煞), auspicious hours, 28 mansions. Per-day pages: ${SITE_URL}/zh/tools/almanac/YYYY-MM-DD
- [Name selection / 八字起名](${SITE_URL}/zh/tools/naming): names balanced by the Five Elements.
- [All tools (English UI)](${SITE_URL}/en/tools)

## Topics
${PILLARS.map((p) => `- [${p.zhTitle} / ${p.enTitle}](${SITE_URL}/zh/services/${p.slug}): ${p.enDesc}`).join('\n')}

## Articles
${articles || `- [All articles](${SITE_URL}/zh)`}

## Optional
- [RSS feed](${SITE_URL}/rss.xml)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [About the author](${SITE_URL}/en/about)
- [Contact](${SITE_URL}/en/contact)
- [Privacy policy](${SITE_URL}/en/privacy)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
