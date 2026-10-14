import { createSupabasePublicClient } from '@/lib/supabase/server';
import { articleContentLocale, articlePath } from '@/lib/blog/locale';
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
      .select('id,slug,title,summary,category')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(200);
    articles = (data || [])
      .map((a) => {
        const url = `${SITE_URL}/${articleContentLocale(a.title)}${articlePath(a)}`;
        const note = [a.category, a.summary].filter(Boolean).join(' — ');
        return `- [${a.title}](${url})${note ? `: ${note}` : ''}`;
      })
      .join('\n');
  } catch (e) {
    console.error('[llms.txt] Failed to load articles:', e);
  }

  const body = `# 旭通命理小站 (Xu Tong Ming Li Xiao Zhan)

> Chinese metaphysics site by 卧烟居士 (Wo Yan Ju Shi): free online BaZi (Four Pillars of Destiny / 八字排盘), Yin Pan Qimen Dunjia (阴盘奇门遁甲), Da Liu Ren (大六壬) and Chinese almanac (万年历 / 老黄历) calculators, plus original Chinese-language articles on Ten Gods (十神), chart structures (格局), useful gods (用神), date selection (择日) and name selection (起名).

- Tools are free and compute in the browser; no sign-up needed.
- The UI is available in English (/en), Simplified Chinese (/zh), Japanese (/ja), Korean (/ko) and Arabic (/ar). Articles are written in Chinese; their canonical URLs are under /zh.
- Author: 卧烟居士 (Traditional: 臥煙居士) — X/Twitter @Rollkey8, email wyh93829@gmail.com.

## Free tools
- [BaZi chart / 八字排盘](${SITE_URL}/zh/tools/bazi): four pillars, hidden stems, Ten Gods, Na Yin, void, luck cycles (大运) and solar terms.
- [Yin Pan Qimen Dunjia / 阴盘奇门排盘](${SITE_URL}/zh/tools/qimen): hour-based Qimen chart with palaces, doors, stars and deities.
- [Da Liu Ren / 大六壬起课](${SITE_URL}/zh/tools/daliuren): four-position reading (人元 human stem, 贵神 noble spirit, 将神 general, 地分 earth branch) with moon general, void and stem-branch relations.
- [Chinese almanac / 万年历·老黄历](${SITE_URL}/zh/tools/almanac): daily yi/ji (宜忌), clashes (冲煞), auspicious hours, 28 mansions. Per-day pages: ${SITE_URL}/zh/tools/almanac/YYYY-MM-DD
- [Name selection / 八字起名](${SITE_URL}/zh/tools/naming): names balanced by the Five Elements.
- [Chinese zodiac calculator](${SITE_URL}/en/chinese-zodiac): find your animal and element by birth date (Lunar New Year vs Li Chun), with a page for every year 1924 to 2043, e.g. ${SITE_URL}/en/chinese-zodiac/1990
- [Chinese zodiac compatibility](${SITE_URL}/en/chinese-zodiac/compatibility): all 78 sign pairs rated by the classical trine, harmony, clash, harm, punishment and break relations
- [Year of the Fire Horse 2026](${SITE_URL}/en/year-of-the-fire-horse-2026) and [Chinese New Year 2027](${SITE_URL}/en/chinese-new-year-2027): dates and Tai Sui outlook per sign
- [BaZi glossary (English)](${SITE_URL}/en/terms): stems, branches, Ten Gods, solar terms, 60 Jia Zi
- [All tools (English UI)](${SITE_URL}/en/tools)

## Topics
${PILLARS.map((p) => `- [${p.zhTitle} / ${p.enTitle}](${SITE_URL}/zh/services/${p.slug}): ${p.enDesc}`).join('\n')}

## Terms library (Chinese)
- [命理术语库 / Chinese metaphysics glossary](${SITE_URL}/zh/terms): 10 heavenly stems, 12 earthly branches, 10 Ten Gods, 24 solar terms and the 60 Jia Zi, one page each, e.g. ${SITE_URL}/zh/terms/tiangan/%E7%94%B2 (甲), ${SITE_URL}/zh/terms/jiazi/%E7%94%B2%E5%AD%90 (甲子).

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
