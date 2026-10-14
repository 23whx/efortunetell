import type { Metadata } from 'next';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { absoluteUrl } from '@/lib/i18n/seo';
import { WEBSITE_ID, jsonLd } from '@/lib/site';
import { TERM_CATEGORIES, termPath, type TermCategory } from '@/lib/glossary';
import { CATEGORY_EN } from '@/components/glossary/TermPageEn';
import { SHISHEN_EN } from '@/lib/glossary/en';
import { SOLAR_TERM_EN } from '@/lib/paipan/almanac/en';

type Props = { params: Promise<{ locale: string }> };

const TITLE = '命理术语库：天干、地支、十神、节气、六十甲子';
const DESCRIPTION = '八字命理基础术语一站查：十天干、十二地支、十神、二十四节气与六十甲子，每个术语都有五行阴阳、合冲刑害、纳音、长生与在八字奇门六壬中的用法。';

const TITLE_EN = 'BaZi Glossary: Heavenly Stems, Earthly Branches, Ten Gods, Solar Terms and the 60 Jia Zi';
const DESCRIPTION_EN = 'A glossary of Chinese metaphysics terms: the 10 heavenly stems, 12 earthly branches, Ten Gods, 24 solar terms and the 60 Jia Zi, each with element, polarity, relations and its role in BaZi.';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const url = absoluteUrl(en ? 'en' : 'zh', '/terms');
  return {
    title: en ? TITLE_EN : TITLE,
    description: en ? DESCRIPTION_EN : DESCRIPTION,
    alternates: { canonical: url, languages: { 'zh-CN': absoluteUrl('zh', '/terms'), en: absoluteUrl('en', '/terms'), 'x-default': absoluteUrl('en', '/terms') } },
    openGraph: { title: en ? TITLE_EN : TITLE, description: en ? DESCRIPTION_EN : DESCRIPTION, url },
  };
}

/** Label shown on the English index tiles */
function enLabel(c: TermCategory, n: string): string {
  if (c === 'shishen') return SHISHEN_EN[n]?.en ?? n;
  if (c === 'jieqi') return SOLAR_TERM_EN[n] ?? n;
  return n;
}

export default async function TermsIndex({ params }: Props) {
  const { locale } = await params;
  const en = locale === 'en';
  if (!en && locale !== 'zh') permanentRedirect('/zh/terms');
  const L = en ? 'en' : 'zh';
  const cats = Object.keys(TERM_CATEGORIES) as TermCategory[];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: en ? TITLE_EN : TITLE,
    description: en ? DESCRIPTION_EN : DESCRIPTION,
    url: absoluteUrl(L, '/terms'),
    inLanguage: en ? 'en' : 'zh-CN',
    isPartOf: { '@id': WEBSITE_ID },
    hasPart: cats.map((c) => ({
      '@type': 'DefinedTermSet',
      name: en ? CATEGORY_EN[c].label : TERM_CATEGORIES[c].label,
      description: en ? CATEGORY_EN[c].intro : TERM_CATEGORIES[c].intro,
      hasDefinedTerm: TERM_CATEGORIES[c].names.map((n) => ({ '@type': 'DefinedTerm', name: n, url: absoluteUrl(L, termPath(c, n)) })),
    })),
  };

  return (
    <div lang={en ? 'en' : 'zh-CN'} className="max-w-5xl mx-auto px-5 py-12 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">{en ? 'BaZi glossary' : '命理术语库'}</h1>
      <p className="mt-4 max-w-2xl text-stone-500 leading-relaxed text-pretty">{en ? DESCRIPTION_EN : DESCRIPTION}</p>
      <nav aria-label={en ? 'Categories' : '分类'} className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <a key={c} href={`#${c}`} className="rounded-full border border-[#efe8dc] bg-white px-4 py-1.5 text-sm text-stone-700 hover:border-[#FF6F61]/50 hover:text-[#c2483c] transition-colors">
            {en ? CATEGORY_EN[c].label : TERM_CATEGORIES[c].label}
          </a>
        ))}
      </nav>

      {cats.map((c) => (
        <section key={c} id={c} className="mt-14 scroll-mt-24">
          <div className="flex items-baseline justify-between gap-4 border-b border-[#efe8dc] pb-3">
            <h2 className="font-display text-2xl font-bold text-stone-900">{en ? CATEGORY_EN[c].label : TERM_CATEGORIES[c].label}</h2>
            <span className="text-sm text-stone-400 tabular-nums">{TERM_CATEGORIES[c].names.length}{en ? '' : ' 个'}</span>
          </div>
          <p className="mt-3 text-[15px] leading-7 text-stone-600 max-w-3xl">{en ? CATEGORY_EN[c].intro : TERM_CATEGORIES[c].intro}</p>
          <ul className={`mt-5 grid gap-2 ${en && (c === 'shishen' || c === 'jieqi') ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5' : c === 'jiazi' ? 'grid-cols-5 sm:grid-cols-10' : c === 'jieqi' ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8' : 'grid-cols-5 sm:grid-cols-6 md:grid-cols-12'}`}>
            {TERM_CATEGORIES[c].names.map((n) => (
              <li key={n}>
                <Link
                  href={`/${L}${termPath(c, n)}`}
                  className={`flex items-center justify-center rounded-xl border border-[#efe8dc] bg-white py-2.5 text-center font-display text-stone-800 ${en && (c === 'shishen' || c === 'jieqi') ? 'px-2 text-sm' : 'text-lg'} hover:border-[#FF6F61]/50 hover:text-[#c2483c] hover:-translate-y-0.5 transition-all`}
                >
                  {en ? enLabel(c, n) : n}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
