import Link from 'next/link';
import { yearOutlook } from '@/lib/zodiac/forecast';
import { compatSlug } from '@/lib/zodiac/compat';
import { zodiacYear, formatLong } from '@/lib/zodiac/years';
import { absoluteUrl } from '@/lib/i18n/seo';
import { AUTHOR_ID, ORG_ID, WEBSITE_ID, jsonLd } from '@/lib/site';

const TONE = {
  good: 'border-emerald-200 bg-emerald-50/60',
  mixed: 'border-amber-200 bg-amber-50/60',
  caution: 'border-rose-200 bg-rose-50/60',
  neutral: 'border-[#efe8dc] bg-white',
} as const;

export type Section = { h: string; p: string[] };

/** Shared layout for the year feature articles (Fire Horse 2026, Chinese New Year 2027) */
export default function YearFeature({
  year,
  path,
  title,
  intro,
  sections,
  sources,
}: {
  year: number;
  path: string;
  title: string;
  intro: string;
  sections: Section[];
  sources: Array<[string, string]>;
}) {
  const z = zodiacYear(year);
  const outlook = yearOutlook(z.animal.key);
  const url = absoluteUrl('en', path);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: intro,
    url,
    inLanguage: 'en',
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    datePublished: '2026-10-14',
    dateModified: '2026-10-14',
  };

  return (
    <article lang="en" className="max-w-3xl mx-auto px-5 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="breadcrumb" className="text-sm text-stone-400">
        <Link href="/en/chinese-zodiac" className="hover:text-[#c2483c]">Chinese Zodiac</Link>
        <span className="mx-2">/</span>
        <Link href={`/en/chinese-zodiac/${year}`} className="hover:text-[#c2483c]">{year}</Link>
      </nav>
      <h1 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight text-stone-900 text-balance">{title}</h1>
      <p className="mt-4 text-[15px] leading-7 text-stone-600">{intro}</p>

      <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-[#efe8dc] bg-[#efe8dc] text-sm">
        {[
          ['Starts', formatLong(z.newYear)],
          ['Ends', formatLong(z.lastDay)],
          ['Sign', `${z.yang ? 'Yang' : 'Yin'} ${z.element.name} ${z.animal.name}`],
          ['Stem-branch', `${z.ganZhi} (${z.pinyin})`],
        ].map(([k, v]) => (
          <div key={k} className="bg-white px-4 py-3">
            <dt className="text-xs text-stone-400">{k}</dt>
            <dd className="mt-1 font-medium text-stone-900">{v}</dd>
          </div>
        ))}
      </dl>

      {sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="font-display text-2xl font-bold text-stone-900">{s.h}</h2>
          {s.p.map((para) => (
            <p key={para} className="mt-3 text-[15px] leading-7 text-stone-600">{para}</p>
          ))}
        </section>
      ))}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">{year} outlook for each sign</h2>
        <p className="mt-3 text-[15px] leading-7 text-stone-600">
          Popular forecasts start from Tai Sui, the deity of the year, and how each birth sign relates to the {z.animal.name}. This
          is what those traditional rules say; treat it as culture, not prediction.
        </p>
        <ul className="mt-5 grid gap-3">
          {outlook.map((o) => (
            <li key={o.sign.key} className={`rounded-2xl border p-4 ${TONE[o.tone]}`}>
              <h3 className="font-semibold text-stone-900">
                <Link href={`/en/chinese-zodiac/compatibility/${compatSlug(o.sign.key, z.animal.key)}`} className="hover:text-[#c2483c]">
                  {o.sign.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm leading-6 text-stone-600">{o.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-stone-900">Sources and further reading</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-stone-600 space-y-1">
          {sources.map(([href, label]) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#c2483c] hover:underline underline-offset-2">{label}</a>
            </li>
          ))}
        </ul>
      </section>

      <div className="result-hero relative overflow-hidden mt-12 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-stone-600 text-sm">Your year sign is one of eight characters.</span>
        <Link href="/en/tools/bazi" className="rounded-xl bg-[#FF6F61] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f25d4f] transition-colors">
          Get your free BaZi chart
        </Link>
      </div>
    </article>
  );
}
