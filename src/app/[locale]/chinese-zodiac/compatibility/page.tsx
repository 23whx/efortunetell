import type { Metadata } from 'next';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { ANIMALS } from '@/lib/zodiac/data';
import { ALL_PAIRS, RELATION_TEXT, TONE, compat } from '@/lib/zodiac/compat';
import { absoluteUrl } from '@/lib/i18n/seo';
import { WEBSITE_ID, jsonLd } from '@/lib/site';

type Props = { params: Promise<{ locale: string }> };

const TITLE = 'Chinese Zodiac Compatibility Chart: All 12 Signs';
const DESCRIPTION =
  'Chinese zodiac compatibility for every pair of the 12 animal signs, based on the classical trine, secret friend, clash, harm, punishment and break relations. Find your best and most challenging matches.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('en', '/chinese-zodiac/compatibility') },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl('en', '/chinese-zodiac/compatibility') },
};


export default async function CompatibilityHub({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'en') permanentRedirect('/en/chinese-zodiac/compatibility');
  const url = absoluteUrl('en', '/chinese-zodiac/compatibility');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: TITLE,
    description: DESCRIPTION,
    url,
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ALL_PAIRS.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${p.a.name} and ${p.b.name} compatibility`,
        url: absoluteUrl('en', `/chinese-zodiac/compatibility/${p.slug}`),
      })),
    },
  };

  return (
    <div lang="en" className="max-w-5xl mx-auto px-5 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="breadcrumb" className="text-sm text-stone-400">
        <Link href="/en/chinese-zodiac" className="hover:text-[#c2483c]">Chinese Zodiac</Link>
        <span className="mx-2">/</span>
        <span>Compatibility</span>
      </nav>
      <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-stone-900 text-balance">Chinese zodiac compatibility</h1>
      <p className="mt-4 max-w-2xl text-stone-600 leading-relaxed text-pretty">
        Pick two signs to see how they get along. Ratings follow the classical relations between the earthly branches, not
        guesswork. Don&apos;t know your sign? <Link href="/en/chinese-zodiac" className="text-[#c2483c] hover:underline underline-offset-2">Find it by birth date</Link>.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[#efe8dc] bg-white p-3">
        <table className="w-full min-w-[720px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="w-20" />
              {ANIMALS.map((a) => (
                <th key={a.key} scope="col" className="px-1 py-1 font-semibold text-stone-600">{a.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANIMALS.map((a) => (
              <tr key={a.key}>
                <th scope="row" className="pr-2 text-right font-semibold text-stone-600">{a.name}</th>
                {ANIMALS.map((b) => {
                  const c = compat(a, b);
                  return (
                    <td key={b.key} className="p-0">
                      <Link
                        href={`/en/chinese-zodiac/compatibility/${c.slug}`}
                        title={`${a.name} and ${b.name}: ${c.label}`}
                        className={`block rounded-md px-1 py-2 text-center font-medium hover:ring-2 hover:ring-[#FF6F61]/50 ${TONE[c.label]}`}
                      >
                        {c.label === 'Some friction' ? 'Friction' : c.label}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">How the ratings work</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {Object.values(RELATION_TEXT).map((r) => (
            <div key={r.name} className="rounded-2xl border border-[#efe8dc] bg-white p-5">
              <dt className="font-semibold text-stone-900">{r.name} <span className="text-stone-400" lang="zh-CN">{r.zh}</span></dt>
              <dd className="mt-2 text-sm leading-6 text-stone-600">{r.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-3xl text-[15px] leading-7 text-stone-600">
          Trines and secret friends count in favour of a match; clashes, harms, punishments and breaks count against it. Some pairs
          have more than one relation, and the rating weighs them together. Birth-year signs are only a first look: a BaZi
          comparison of both charts, especially the day pillars, says much more.
        </p>
      </section>
    </div>
  );
}
