import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ANIMAL_BY_KEY } from '@/lib/zodiac/data';
import { FIRST_YEAR, LAST_YEAR, ZODIAC_YEARS, formatIso, formatLong, isZodiacYear, zodiacYear } from '@/lib/zodiac/years';
import { absoluteUrl } from '@/lib/i18n/seo';
import { AUTHOR_ID, OG_IMAGES, ORG_ID, SITE_URL, WEBSITE_ID, jsonLd } from '@/lib/site';

// English-only pages (other locales redirect here)
export const revalidate = 86400;

type Props = { params: Promise<{ locale: string; year: string }> };

export function generateStaticParams() {
  return ZODIAC_YEARS.map((y) => ({ locale: 'en', year: String(y) }));
}

function headline(year: number) {
  const z = zodiacYear(year);
  const sign = `${z.element.name} ${z.animal.name}`;
  return {
    z,
    sign,
    title: `${year} Chinese Zodiac: Year of the ${sign} (${z.ganZhi})`,
    description: `${year} is the year of the ${sign} (${z.ganZhi}, ${z.pinyin}), from ${formatLong(z.newYear)} to ${formatLong(z.lastDay)}. Personality, compatibility, Na Yin element and why January births may belong to the previous sign.`,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  if (!isZodiacYear(year)) return {};
  const h = headline(Number(year));
  const url = absoluteUrl('en', `/chinese-zodiac/${year}`);
  return {
    title: h.title,
    description: h.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: h.title, description: h.description, url, images: [{ url: OG_IMAGES.default, width: 1200, height: 630 }] },
  };
}

/** "a Metal Horse" / "an Earth Snake" */
function withArticle(sign: string) {
  return `${/^[AEIOU]/.test(sign) ? 'an' : 'a'} ${sign}`;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-xs text-stone-400">{label}</dt>
      <dd className="mt-1 text-[15px] font-medium text-stone-900">{children}</dd>
    </div>
  );
}

export default async function ZodiacYearPage({ params }: Props) {
  const { locale, year: raw } = await params;
  if (!isZodiacYear(raw)) notFound();
  if (locale !== 'en') permanentRedirect(`/en/chinese-zodiac/${raw}`);

  const year = Number(raw);
  const { z, sign, title, description } = headline(year);
  const a = z.animal;
  const thisYear = new Date().getFullYear();
  const url = absoluteUrl('en', `/chinese-zodiac/${year}`);
  const lc = z.liChun;
  const liChunText = `${formatLong(lc)}, ${String(lc.hh).padStart(2, '0')}:${String(lc.mm).padStart(2, '0')} China time`;
  const lnyBeforeLiChun = formatIso(z.newYear) < formatIso(lc);
  const sameAnimal = ZODIAC_YEARS.filter((y) => y !== year && (y - year) % 12 === 0);
  const sameCombo = ZODIAC_YEARS.filter((y) => y !== year && (y - year) % 60 === 0);
  const prevSign = zodiacYear(year - 1);
  const eve = new Date(z.newYear.y, z.newYear.m - 1, z.newYear.d - 1);
  const dayBeforeNewYear = formatLong({ y: eve.getFullYear(), m: eve.getMonth() + 1, d: eve.getDate() }).replace(`, ${year}`, '');

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        description,
        url,
        inLanguage: 'en',
        image: `${SITE_URL}${OG_IMAGES.default}`,
        author: { '@id': AUTHOR_ID },
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@type': 'DefinedTerm', name: `${sign} (${z.ganZhi})` },
        datePublished: '2026-10-14',
        dateModified: '2026-10-14',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Chinese Zodiac', item: absoluteUrl('en', '/chinese-zodiac') },
          { '@type': 'ListItem', position: 2, name: `${year}`, item: url },
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
        <span>{year}</span>
      </nav>

      <div className="mt-6 flex items-end gap-5">
        <span className="font-display text-7xl md:text-8xl font-bold leading-none text-stone-900" lang="zh-CN" aria-hidden>
          {a.zh}
        </span>
        <span className="pb-2 text-sm text-stone-400" lang="zh-CN">{z.ganZhi}</span>
      </div>
      <h1 className="mt-5 font-display text-3xl md:text-4xl font-bold tracking-tight text-stone-900 text-balance">
        {year}: Year of the {sign}
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-stone-600">
        The Chinese zodiac sign for {year} is the <strong>{sign}</strong>. The {sign} year runs from the Lunar New Year on{' '}
        {formatLong(z.newYear)} to {formatLong(z.lastDay)}.
      </p>

      <dl className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[#efe8dc] bg-[#efe8dc]">
        <Fact label="Animal">{a.name} ({a.zh})</Fact>
        <Fact label="Element">{z.yang ? 'Yang' : 'Yin'} {z.element.name}</Fact>
        <Fact label="Stem-branch">{z.ganZhi} · {z.pinyin}</Fact>
        <Fact label="Lunar New Year">{formatLong(z.newYear)}</Fact>
        <Fact label="Li Chun (BaZi year start)">{liChunText}</Fact>
        <Fact label="Na Yin">{z.naYinEn} ({z.naYin})</Fact>
      </dl>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">Born in January or February {year}?</h2>
        <div className="mt-3 space-y-3 text-[15px] leading-7 text-stone-600">
          <p>
            If you were born from January 1 to {dayBeforeNewYear}, {year},
            your popular zodiac sign is the previous year&apos;s{' '}
            {year > FIRST_YEAR ? (
              <Link href={`/en/chinese-zodiac/${year - 1}`} className="text-[#c2483c] hover:underline underline-offset-2">
                {prevSign.element.name} {prevSign.animal.name}
              </Link>
            ) : (
              `${prevSign.element.name} ${prevSign.animal.name}`
            )}
            , because the {sign} year starts on {formatLong(z.newYear)}.
          </p>
          <p>
            In BaZi (Four Pillars of Destiny) the year changes at Li Chun instead, on {liChunText}.{' '}
            {lnyBeforeLiChun
              ? `In ${year} the Lunar New Year came first, so people born between the two dates are ${withArticle(sign)} by the popular count but still ${withArticle(`${prevSign.element.name} ${prevSign.animal.name}`)} in their BaZi year pillar.`
              : `In ${year} Li Chun came first, so people born between the two dates already have the ${sign} year pillar in BaZi while their popular sign is still the ${prevSign.element.name} ${prevSign.animal.name}.`}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">The {sign} personality</h2>
        <div className="mt-3 space-y-3 text-[15px] leading-7 text-stone-600">
          <p><strong className="text-stone-800">Strengths:</strong> {a.strengths}</p>
          <p><strong className="text-stone-800">Challenges:</strong> {a.challenges}</p>
          <p>
            <strong className="text-stone-800">The {z.element.name} influence:</strong> {z.element.trait} {z.yang ? 'As a yang year, it shows outwardly and actively.' : 'As a yin year, it works more quietly and inwardly.'}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">Compatibility</h2>
        <ul className="mt-3 space-y-2 text-[15px] leading-7 text-stone-600">
          <li>
            <strong className="text-stone-800">Best matches:</strong> {a.trine.map((k) => ANIMAL_BY_KEY[k].name).join(' and ')} (the same
            trine), and the {ANIMAL_BY_KEY[a.secretFriend].name} (secret friend).
          </li>
          <li>
            <strong className="text-stone-800">Most challenging:</strong> the {ANIMAL_BY_KEY[a.clash].name}, the opposite sign that
            clashes with the {a.name}, and the {ANIMAL_BY_KEY[a.harm].name} (harm relationship).
          </li>
        </ul>
        <p className="mt-3 text-[15px] leading-7 text-stone-600">
          Animal signs only compare birth years. A full BaZi compatibility reading looks at all eight characters, especially the day pillar.
          See every {a.name} pairing on the <Link href="/en/chinese-zodiac/compatibility" className="text-[#c2483c] hover:underline underline-offset-2">compatibility chart</Link>.
          {year === 2026 && <> Read more about the <Link href="/en/year-of-the-fire-horse-2026" className="text-[#c2483c] hover:underline underline-offset-2">Year of the Fire Horse 2026</Link>.</>}
          {year === 2027 && <> Read more about <Link href="/en/chinese-new-year-2027" className="text-[#c2483c] hover:underline underline-offset-2">Chinese New Year 2027</Link>.</>}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">Na Yin: {z.naYinEn}</h2>
        <p className="mt-3 text-[15px] leading-7 text-stone-600">
          Each pair of years in the 60-year cycle shares a Na Yin, or &ldquo;sound&rdquo; element, used in traditional astrology alongside
          the stem&apos;s element. {year} ({z.ganZhi}) is <em>{z.naYin}</em>, {z.naYinEn}: {z.naYinMeaning}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-stone-900">Other {a.name} years</h2>
        <p className="mt-3 flex flex-wrap gap-2">
          {sameAnimal.map((y) => {
            const o = zodiacYear(y);
            return (
              <Link key={y} href={`/en/chinese-zodiac/${y}`} className={`rounded-lg border px-3 py-1.5 text-sm hover:border-[#FF6F61]/50 hover:text-[#c2483c] ${sameCombo.includes(y) ? 'border-[#FF6F61]/40 bg-[#fff4f1] text-stone-900' : 'border-[#efe8dc] bg-white text-stone-700'}`}>
                {y} {o.element.name}
              </Link>
            );
          })}
        </p>
        {sameCombo.length > 0 && (
          <p className="mt-3 text-sm text-stone-500">Highlighted: the same {sign} combination, which returns every 60 years.</p>
        )}
        {year < thisYear && (
          <p className="mt-3 text-sm text-stone-500">People born in the {sign} year turn {thisYear - year} in {thisYear}.</p>
        )}
      </section>

      <nav aria-label="Years" className="mt-12 flex justify-between text-sm">
        {year > FIRST_YEAR ? (
          <Link href={`/en/chinese-zodiac/${year - 1}`} className="text-[#c2483c] hover:underline underline-offset-2">← {year - 1}</Link>
        ) : <span />}
        {year < LAST_YEAR && (
          <Link href={`/en/chinese-zodiac/${year + 1}`} className="text-[#c2483c] hover:underline underline-offset-2">{year + 1} →</Link>
        )}
      </nav>

      <div className="result-hero relative overflow-hidden mt-10 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-stone-600 text-sm">Your birth year is one of eight characters.</span>
        <Link href="/en/tools/bazi" className="rounded-xl bg-[#FF6F61] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f25d4f] transition-colors">
          Get your free BaZi chart
        </Link>
      </div>
    </article>
  );
}
