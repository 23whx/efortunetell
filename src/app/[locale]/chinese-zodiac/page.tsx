import type { Metadata } from 'next';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import ZodiacCalculator from '@/components/zodiac/ZodiacCalculator';
import { ANIMALS, ELEMENTS } from '@/lib/zodiac/data';
import { ZODIAC_YEARS, formatLong, zodiacYear } from '@/lib/zodiac/years';
import { absoluteUrl } from '@/lib/i18n/seo';
import { OG_IMAGES, WEBSITE_ID, jsonLd } from '@/lib/site';

// English-only page (other locales redirect here)
type Props = { params: Promise<{ locale: string }> };

const TITLE = 'Chinese Zodiac Calculator: What Is My Chinese Zodiac Sign?';
const DESCRIPTION =
  'Find your Chinese zodiac animal and element from your birth date. Includes Chinese zodiac signs by year from 1924 to 2043 with exact Lunar New Year dates, and how BaZi uses Li Chun instead.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('en', '/chinese-zodiac') },
  openGraph: { title: TITLE, description: DESCRIPTION, url: absoluteUrl('en', '/chinese-zodiac'), images: [{ url: OG_IMAGES.default, width: 1200, height: 630 }] },
};

export default async function ChineseZodiacPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== 'en') permanentRedirect('/en/chinese-zodiac');

  const years = ZODIAC_YEARS.map(zodiacYear);
  const thisYear = new Date().getFullYear();
  const url = absoluteUrl('en', '/chinese-zodiac');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Chinese Zodiac Calculator',
        url,
        description: DESCRIPTION,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any (web browser)',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('en', '/') },
          { '@type': 'ListItem', position: 2, name: 'Chinese Zodiac', item: url },
        ],
      },
    ],
  };

  // group the table by decade for scanning
  const decades = new Map<number, typeof years>();
  for (const y of years) {
    const d = Math.floor(y.year / 10) * 10;
    decades.set(d, [...(decades.get(d) || []), y]);
  }

  return (
    <div lang="en" className="max-w-5xl mx-auto px-5 py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-stone-900 text-balance">
        What is my Chinese zodiac sign?
      </h1>
      <p className="mt-4 max-w-2xl text-stone-600 leading-relaxed text-pretty">
        Enter your birth date to find your animal and element. The Chinese year starts at the Lunar New Year, not on January 1, so
        people born in January or early February often belong to the previous year&apos;s sign.
      </p>
      <p className="mt-3 text-sm text-stone-600">
        Also see the <Link href="/en/chinese-zodiac/compatibility" className="font-medium text-[#c2483c] hover:underline underline-offset-2">compatibility chart</Link>,{' '}
        the <Link href="/en/year-of-the-fire-horse-2026" className="font-medium text-[#c2483c] hover:underline underline-offset-2">Year of the Fire Horse 2026</Link> and{' '}
        <Link href="/en/chinese-new-year-2027" className="font-medium text-[#c2483c] hover:underline underline-offset-2">Chinese New Year 2027</Link>.
      </p>

      <div className="mt-8">
        <ZodiacCalculator />
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">Lunar New Year or Li Chun?</h2>
        <div className="mt-4 max-w-3xl space-y-3 text-[15px] leading-7 text-stone-600">
          <p>
            In everyday use, the zodiac year changes at the <strong>Lunar New Year</strong> (Spring Festival), which falls between
            January 21 and February 20. This is the date used for birthday signs, festivals and most calendars.
          </p>
          <p>
            Chinese astrology (BaZi, the Four Pillars of Destiny) uses <strong>Li Chun</strong>, the Start of Spring solar term, around
            February 4. If you were born between these two dates, your popular sign and your BaZi year pillar differ, and the
            calculator above shows both.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">The 12 animals</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ANIMALS.map((a) => {
            const recent = years.filter((y) => y.animal.key === a.key && y.year >= 1960 && y.year <= thisYear + 12).map((y) => y.year);
            return (
              <li key={a.key} className="rounded-2xl border border-[#efe8dc] bg-white p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl font-bold text-stone-900">{a.name}</h3>
                  <span className="font-display text-2xl text-[#FF6F61]/70" lang="zh-CN">{a.zh}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{a.strengths}</p>
                <p className="mt-3 text-sm text-stone-500">
                  {recent.map((yr, i) => (
                    <span key={yr}>
                      {i > 0 && ', '}
                      <Link href={`/en/chinese-zodiac/${yr}`} className="text-[#c2483c] hover:underline underline-offset-2">{yr}</Link>
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">Chinese zodiac signs by year (1924 to 2043)</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-stone-600">
          Each year is a combination of one of the five elements ({Object.values(ELEMENTS).map((e) => e.name).join(', ')}) and one
          of the 12 animals, giving a 60-year cycle. Dates are the Lunar New Year in China Standard Time.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[...decades.entries()].map(([decade, list]) => (
            <div key={decade} className="overflow-hidden rounded-2xl border border-[#efe8dc] bg-white">
              <h3 className="bg-[#fbf7f1] px-4 py-2 text-sm font-semibold text-stone-700">{decade}s</h3>
              <table className="w-full text-sm">
                <thead className="sr-only">
                  <tr><th>Year</th><th>Sign</th><th>Starts</th></tr>
                </thead>
                <tbody>
                  {list.map((y) => (
                    <tr key={y.year} className={y.year === thisYear ? 'bg-[#fff4f1]' : ''}>
                      <td className="px-4 py-1.5 tabular-nums">
                        <Link href={`/en/chinese-zodiac/${y.year}`} className="font-medium text-[#c2483c] hover:underline underline-offset-2">{y.year}</Link>
                      </td>
                      <td className="px-2 py-1.5 text-stone-800">{y.element.name} {y.animal.name}</td>
                      <td className="px-4 py-1.5 text-right text-stone-500 tabular-nums">{formatLong(y.newYear).replace(/, \d{4}$/, '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
