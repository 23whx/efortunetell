import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ANIMALS, ANIMAL_BY_KEY } from '@/lib/zodiac/data';
import { ALL_PAIRS, RELATION_TEXT, TONE, adviceFor, compat, compatBySlug } from '@/lib/zodiac/compat';
import { ZODIAC_YEARS, zodiacYear } from '@/lib/zodiac/years';
import { absoluteUrl } from '@/lib/i18n/seo';
import { AUTHOR_ID, ORG_ID, WEBSITE_ID, jsonLd } from '@/lib/site';

type Props = { params: Promise<{ locale: string; pair: string }> };

export function generateStaticParams() {
  return ALL_PAIRS.map((p) => ({ locale: 'en', pair: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const c = compatBySlug(pair);
  if (!c) return {};
  const same = c.a.key === c.b.key;
  const title = same ? `${c.a.name} and ${c.a.name} Compatibility (Chinese Zodiac)` : `${c.a.name} and ${c.b.name} Compatibility: Chinese Zodiac Love & Friendship`;
  const description = `${c.a.name} and ${c.b.name} compatibility: ${c.label.toLowerCase()} match${c.relations.length ? ` (${c.relations.map((r) => RELATION_TEXT[r].name).join(', ')})` : ''}. What draws them together, where friction comes from, and advice for love and work.`;
  const url = absoluteUrl('en', `/chinese-zodiac/compatibility/${c.slug}`);
  return { title, description, alternates: { canonical: url }, openGraph: { type: 'article', title, description, url } };
}

export default async function PairPage({ params }: Props) {
  const { locale, pair } = await params;
  const c = compatBySlug(pair);
  if (!c) {
    // "ox-rat" → canonical "rat-ox"
    const reversed = compatBySlug(pair.split('-').reverse().join('-'));
    if (reversed) permanentRedirect(`/en/chinese-zodiac/compatibility/${reversed.slug}`);
    notFound();
  }
  if (locale !== 'en') permanentRedirect(`/en/chinese-zodiac/compatibility/${c.slug}`);

  const { a, b } = c;
  const same = a.key === b.key;
  const advice = adviceFor(c);
  const url = absoluteUrl('en', `/chinese-zodiac/compatibility/${c.slug}`);
  const recent = (key: string) => ZODIAC_YEARS.filter((y) => y >= 1960 && y <= 2031 && zodiacYear(y).animal.key === key);
  const others = (x: typeof a) => ANIMALS.filter((o) => o.key !== (x.key === a.key ? b.key : a.key)).map((o) => compat(x, o));

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${a.name} and ${b.name} compatibility`,
        url,
        inLanguage: 'en',
        author: { '@id': AUTHOR_ID },
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': WEBSITE_ID },
        datePublished: '2026-10-14',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Chinese Zodiac', item: absoluteUrl('en', '/chinese-zodiac') },
          { '@type': 'ListItem', position: 2, name: 'Compatibility', item: absoluteUrl('en', '/chinese-zodiac/compatibility') },
          { '@type': 'ListItem', position: 3, name: `${a.name} and ${b.name}`, item: url },
        ],
      },
    ],
  };

  return (
    <article lang="en" className="max-w-3xl mx-auto px-5 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="breadcrumb" className="text-sm text-stone-400">
        <Link href="/en/chinese-zodiac" className="hover:text-[#c2483c]">Chinese Zodiac</Link>
        <span className="mx-2">/</span>
        <Link href="/en/chinese-zodiac/compatibility" className="hover:text-[#c2483c]">Compatibility</Link>
      </nav>

      <div className="mt-6 flex items-center gap-4 font-display text-6xl md:text-7xl font-bold text-stone-900" aria-hidden>
        <span lang="zh-CN">{a.zh}</span>
        <span className="text-3xl text-[#FF6F61]">&amp;</span>
        <span lang="zh-CN">{b.zh}</span>
      </div>
      <h1 className="mt-5 font-display text-3xl md:text-4xl font-bold tracking-tight text-stone-900 text-balance">
        {a.name} and {b.name} compatibility
      </h1>
      <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className={`rounded-full px-3 py-1 font-semibold ${TONE[c.label]}`}>{c.label} match</span>
        {c.relations.map((r) => (
          <span key={r} className="rounded-full border border-[#efe8dc] bg-white px-3 py-1 text-stone-600">
            {RELATION_TEXT[r].name} <span lang="zh-CN">{RELATION_TEXT[r].zh}</span>
          </span>
        ))}
        {c.relations.length === 0 && <span className="rounded-full border border-[#efe8dc] bg-white px-3 py-1 text-stone-600">No special relation</span>}
      </p>

      <section className="mt-8 space-y-3 text-[15px] leading-7 text-stone-600">
        {c.relations.length > 0 ? (
          c.relations.map((r) => <p key={r}>{RELATION_TEXT[r].text}</p>)
        ) : (
          <p>
            The {a.name} ({a.branch}) and the {b.name} ({b.branch}) have no trine, harmony, clash or harm relation. The signs
            neither help nor hinder much, so the people themselves decide how well it works.
          </p>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">What each brings</h2>
        <div className={`mt-4 grid gap-4 ${same ? '' : 'sm:grid-cols-2'}`}>
          {(same ? [a] : [a, b]).map((x) => (
            <div key={x.key} className="rounded-2xl border border-[#efe8dc] bg-white p-5">
              <h3 className="font-semibold text-stone-900">The {x.name}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{x.strengths}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">Watch out for: {x.challenges.charAt(0).toLowerCase() + x.challenges.slice(1)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">Love and relationships</h2>
        <p className="mt-3 text-[15px] leading-7 text-stone-600">{advice.love}</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-stone-900">Work and friendship</h2>
        <p className="mt-3 text-[15px] leading-7 text-stone-600">{advice.work}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">Best and hardest matches for each</h2>
        <ul className="mt-3 space-y-2 text-[15px] leading-7 text-stone-600">
          {(same ? [a] : [a, b]).map((x) => (
            <li key={x.key}>
              <strong className="text-stone-800">{x.name}:</strong> best with {x.trine.map((k) => ANIMAL_BY_KEY[k].name).join(', ')} and{' '}
              {ANIMAL_BY_KEY[x.secretFriend].name}; hardest with {ANIMAL_BY_KEY[x.clash].name} and {ANIMAL_BY_KEY[x.harm].name}.
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">Birth years</h2>
        <ul className="mt-3 space-y-2 text-sm text-stone-600">
          {(same ? [a] : [a, b]).map((x) => (
            <li key={x.key}>
              <strong className="text-stone-800">{x.name}:</strong>{' '}
              {recent(x.key).map((y, i) => (
                <span key={y}>{i > 0 && ', '}<Link href={`/en/chinese-zodiac/${y}`} className="text-[#c2483c] hover:underline underline-offset-2">{y}</Link></span>
              ))}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-stone-500">Born in January or early February? Check the year page, because the sign changes at the Lunar New Year.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">More {a.name} matches</h2>
        <p className="mt-3 flex flex-wrap gap-2">
          {others(a).map((o) => (
            <Link key={o.slug} href={`/en/chinese-zodiac/compatibility/${o.slug}`} className="rounded-lg border border-[#efe8dc] bg-white px-3 py-1.5 text-sm text-stone-700 hover:border-[#FF6F61]/50 hover:text-[#c2483c]">
              {a.name} &amp; {o.b.name}
            </Link>
          ))}
        </p>
      </section>

      <div className="result-hero relative overflow-hidden mt-12 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-stone-600 text-sm">Signs compare birth years only. A BaZi chart shows much more.</span>
        <Link href="/en/tools/bazi" className="rounded-xl bg-[#FF6F61] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f25d4f] transition-colors">
          Get your free BaZi chart
        </Link>
      </div>
    </article>
  );
}
