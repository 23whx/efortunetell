import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPillarBySlug, type PillarKey } from '@/lib/seo/pillars';
import { getServerT } from '@/lib/i18n/server';
import { isLocale, localeHtmlLang, type Locale } from '@/lib/i18n/config';
import { absoluteUrl, buildPageMetadata } from '@/lib/i18n/seo';
import { WEBSITE_ID, jsonLd, type OgImageKey } from '@/lib/site';

type Props = { params: Promise<{ locale: string; slug: string }> };

const PILLAR_OG: Record<PillarKey, OgImageKey> = {
  bazi: 'bazi',
  'qimen-yinpan': 'qimen',
  daliuren: 'daliuren',
  fengshui: 'default',
  naming: 'naming',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const pillar = getPillarBySlug(slug);
  if (!pillar || !isLocale(locale)) return { title: 'Pillar not found' };

  const zh = locale === 'zh';
  return buildPageMetadata({
    locale,
    path: `/services/${pillar.slug}`,
    title: zh ? `${pillar.zhTitle}专题：文章与学习路径` : `${pillar.enTitle}: Articles & Study Guide`,
    description: zh ? pillar.zhDesc : pillar.enDesc,
    keywords: pillar.keywords,
    image: PILLAR_OG[pillar.key],
  });
}

export default async function PillarPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const pillar = getPillarBySlug(slug);
  if (!pillar || !isLocale(rawLocale)) return notFound();
  const locale: Locale = rawLocale;

  const { language, t } = await getServerT(locale);
  const supabase = await createSupabaseServerClient();
  const baseArticlesQuery = supabase
    .from('articles')
    .select('id,title,summary,created_at,tags,cover_image_url')
    .eq('status', 'published')
    .eq('category', pillar.category)
    .order('created_at', { ascending: false })
    .limit(50);

  // “八字理论”文章：主页不展示，但在 专题-八字 里单独展示
  const { data: articles } =
    pillar.category === '八字'
      ? await baseArticlesQuery.not('tags', 'cs', '{"八字理论"}')
      : await baseArticlesQuery;

  const { data: baziTheoryArticles } =
    pillar.category === '八字'
      ? await supabase
          .from('articles')
          .select('id,title,summary,created_at,tags,cover_image_url')
          .eq('status', 'published')
          .eq('category', '八字')
          .contains('tags', ['八字理论'])
          .order('created_at', { ascending: false })
          .limit(50)
      : { data: null };

  const canonical = absoluteUrl(locale, `/services/${pillar.slug}`);
  
  // Normalize key for translation (liuren/qimen instead of daliuren/qimen-yinpan)
  const translationKey = pillar.key.replace('daliuren', 'liuren').replace('qimen-yinpan', 'qimen');
  const title = t(`services.${translationKey}.title`) !== `services.${translationKey}.title` 
    ? t(`services.${translationKey}.title`) 
    : (language === 'zh' ? pillar.zhTitle : pillar.enTitle);
  const desc = t(`services.${translationKey}.desc`) !== `services.${translationKey}.desc`
    ? t(`services.${translationKey}.desc`)
    : (language === 'zh' ? pillar.zhDesc : pillar.enDesc);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${title} ${t('services.title')}`,
    description: desc,
    url: canonical,
    inLanguage: localeHtmlLang[locale],
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [...(articles || []), ...(baziTheoryArticles || [])].map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl('zh', `/blog/${a.id}`),
        name: a.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-20">
        <div className="mb-10">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            {pillar.enTitle}
          </div>
          <h1 className="mt-2 text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-gray-500 font-medium leading-relaxed max-w-3xl">
            {desc}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {pillar.keywordKeys.map((k) => (
              <span
                key={k}
                className="px-3 py-1.5 rounded-full bg-white text-gray-500 text-[10px] font-black uppercase tracking-widest border border-gray-100"
              >
                {t(k)}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 className="text-xl font-black text-gray-900">{t('services.latestArticles')}</h2>
          <Link
            href={`/${locale}`}
            className="text-sm font-black text-[#FF6F61] hover:text-[#ff8a75] transition-colors"
          >
            {t('services.viewAllBlog')} →
          </Link>
        </div>

        {(articles || []).length === 0 ? (
          <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-10 text-center">
            <p className="text-gray-500 font-bold">{t('services.noArticles')}</p>
            <p className="mt-2 text-sm text-gray-400 font-medium">
              {t('services.noArticlesTip')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(articles || []).map((a) => (
              <Link
                key={a.id}
                href={`/${locale}/blog/${a.id}`}
                className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-500"
              >
                <div className="relative aspect-[16/10] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.cover_image_url || '/images/default-image.svg'}
                    alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-2 text-xl font-black text-gray-900 group-hover:text-[#FF6F61] transition-colors line-clamp-2">
                    {a.title}
                  </div>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {a.summary || ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pillar.category === '八字' && (
          <div className="mt-14">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h2 className="text-xl font-black text-gray-900">八字理论</h2>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                仅在专题页展示
              </span>
            </div>

            {(baziTheoryArticles || []).length === 0 ? (
              <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-10 text-center">
                <p className="text-gray-500 font-bold">暂无“八字理论”文章</p>
                <p className="mt-2 text-sm text-gray-400 font-medium">
                  在后台写文章时，把标签里加上“八字理论”即可出现在这里。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(baziTheoryArticles || []).map((a) => (
                  <Link
                    key={a.id}
                    href={`/${locale}/blog/${a.id}`}
                    className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-500"
                  >
                    <div className="relative aspect-[16/10] bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.cover_image_url || '/images/default-image.svg'}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                        {new Date(a.created_at).toLocaleDateString()}
                      </div>
                      <div className="mt-2 text-xl font-black text-gray-900 group-hover:text-[#FF6F61] transition-colors line-clamp-2">
                        {a.title}
                      </div>
                      <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {a.summary || ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
