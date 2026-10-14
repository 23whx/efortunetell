import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Sparkles, Compass, ScrollText, PenLine } from 'lucide-react';
import { isLocale, withLocale, type Locale } from '@/lib/i18n/config';
import { absoluteUrl, buildPageMetadata } from '@/lib/i18n/seo';
import { WEBSITE_ID, jsonLd } from '@/lib/site';

const COPY: Record<
  Locale,
  {
    title: string;
    desc: string;
    items: Array<{ href: string; title: string; desc: string; badge?: string; ready: boolean }>;
  }
> = {
  en: {
    title: 'Metaphysics Tools',
    desc: 'Traditional Chinese calendar and charting tools — free to use, built for accuracy.',
    items: [
      {
        href: '/tools/almanac',
        title: 'Chinese Almanac (Tong Shu)',
        desc: 'Lunar date, pillars, yi/ji, chong-sha, mansions, hours and more.',
        badge: 'Live',
        ready: true,
      },
      {
        href: '/tools/bazi',
        title: 'BaZi Chart',
        desc: 'Four pillars, hidden stems, ten gods, na yin, void, luck cycles.',
        badge: 'Live',
        ready: true,
      },
      {
        href: '/tools/qimen',
        title: 'Yin Pan Qi Men',
        desc: 'Hour-based Yin Pan Qimen Dunjia charting.',
        badge: 'Live',
        ready: true,
      },
      {
        href: '/tools/daliuren',
        title: 'Da Liu Ren',
        desc: 'Classic four-position charting workflow.',
        badge: 'Live',
        ready: true,
      },
      {
        href: '/tools/naming',
        title: 'Naming',
        desc: 'Character lookup and smart name suggestions from BaZi.',
        badge: 'Live',
        ready: true,
      },
    ],
  },
  zh: {
    title: '命理工具',
    desc: '万年历与专业排盘工具，前端本地计算，可随时对照校验。',
    items: [
      {
        href: '/tools/almanac',
        title: '万年历 / 老黄历',
        desc: '农历、四柱、宜忌、冲煞、建除、星宿、时辰吉凶等。',
        badge: '已上线',
        ready: true,
      },
      {
        href: '/tools/bazi',
        title: '八字排盘',
        desc: '四柱、藏干、十神、纳音、空亡、大运起运交运、司令、节气。',
        badge: '已上线',
        ready: true,
      },
      {
        href: '/tools/qimen',
        title: '阴盘奇门',
        desc: '时家阴盘奇门遁甲起盘。',
        badge: '已上线',
        ready: true,
      },
      {
        href: '/tools/daliuren',
        title: '大六壬',
        desc: '四位课式排盘。',
        badge: '已上线',
        ready: true,
      },
      {
        href: '/tools/naming',
        title: '起名改名',
        desc: '汉字属性查询与八字喜用智能取名。',
        badge: '已上线',
        ready: true,
      },
    ],
  },
  ja: {
    title: '命理ツール',
    desc: '万年暦と排盤ツール。',
    items: [
      {
        href: '/tools/almanac',
        title: '万年暦',
        desc: '旧暦・干支・吉凶など。',
        badge: '公開中',
        ready: true,
      },
      { href: '/tools/bazi', title: '四柱推命', desc: '八字排盤', badge: '公開中', ready: true },
      { href: '/tools/qimen', title: '陰盤奇門', desc: '奇門遁甲', badge: '公開中', ready: true },
      { href: '/tools/daliuren', title: '大六壬', desc: '課式排盤', badge: '公開中', ready: true },
      { href: '/tools/naming', title: '命名', desc: '姓名提案', badge: '公開中', ready: true },
    ],
  },
  ko: {
    title: '명리 도구',
    desc: '만년력과 명반 도구.',
    items: [
      {
        href: '/tools/almanac',
        title: '만년력',
        desc: '음력, 간지, 길흉 등.',
        badge: '오픈',
        ready: true,
      },
      { href: '/tools/bazi', title: '사주', desc: '팔자 명반', badge: '오픈', ready: true },
      { href: '/tools/qimen', title: '음반 기문', desc: '기문둔갑', badge: '오픈', ready: true },
      { href: '/tools/daliuren', title: '대육임', desc: '과식 명반', badge: '오픈', ready: true },
      { href: '/tools/naming', title: '작명', desc: '이름 추천', badge: '오픈', ready: true },
    ],
  },
  ar: {
    title: 'أدوات الميتافيزيقا',
    desc: 'التقويم الصيني وأدوات التخطيط.',
    items: [
      {
        href: '/tools/almanac',
        title: 'التقويم الصيني',
        desc: 'التقويم القمري والطالع اليومي.',
        badge: 'متاح',
        ready: true,
      },
      { href: '/tools/bazi', title: 'بازي', desc: 'الأعمدة الأربعة', badge: 'متاح', ready: true },
      { href: '/tools/qimen', title: 'تشي من', desc: 'تشي من دونجيا', badge: 'متاح', ready: true },
      { href: '/tools/daliuren', title: 'دا ليو رن', desc: 'مخطط كلاسيكي', badge: 'متاح', ready: true },
      { href: '/tools/naming', title: 'التسمية', desc: 'اقتراح الأسماء', badge: 'متاح', ready: true },
    ],
  },
};

const ICONS = [CalendarDays, Sparkles, Compass, ScrollText, PenLine];
/** Large watermark glyph per tool (same order as items) */
const GLYPHS = ['历', '八', '奇', '壬', '名'];
/** Bento spans: the almanac is the featured card */
const SPANS = ['sm:col-span-6 lg:col-span-4', 'sm:col-span-3 lg:col-span-2', 'sm:col-span-3 lg:col-span-2', 'sm:col-span-3 lg:col-span-2', 'sm:col-span-3 lg:col-span-2'];

const TRUST: Record<Locale, string[]> = {
  zh: ['完全免费', '无需注册', '浏览器本地计算'],
  en: ['Free', 'No sign-up', 'Runs in your browser'],
  ja: ['無料', '登録不要', 'ブラウザで計算'],
  ko: ['무료', '가입 불필요', '브라우저에서 계산'],
  ar: ['مجاني', 'بدون تسجيل', 'يعمل في متصفحك'],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const c = COPY[raw];
  return buildPageMetadata({
    locale: raw,
    path: '/tools',
    image: 'tools',
    title: c.title,
    description: c.desc,
    keywords: ['Chinese almanac', 'BaZi', 'Qimen', 'Da Liu Ren', 'naming', '万年历', '八字'],
  });
}

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = COPY[locale];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.title,
    description: c.desc,
    url: absoluteUrl(locale, '/tools'),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: c.items
        .filter((item) => item.ready)
        .map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.title,
          url: absoluteUrl(locale, item.href),
        })),
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <h1 className="font-display text-4xl md:text-5xl font-bold text-stone-900 tracking-tight">{c.title}</h1>
      <p className="mt-4 text-stone-500 max-w-2xl leading-relaxed text-pretty">{c.desc}</p>
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
        {TRUST[locale].map((x) => (
          <li key={x} className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6F61]" aria-hidden />
            {x}
          </li>
        ))}
      </ul>
      <div className="mt-10 grid sm:grid-cols-6 gap-4 md:gap-5">
        {c.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          const featured = i === 0;
          const inner = (
            <div
              className={`group relative overflow-hidden rounded-2xl p-6 md:p-7 h-full min-h-[180px] flex flex-col transition-all duration-300 ${
                featured
                  ? 'result-hero hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgba(120,72,40,0.5)]'
                  : 'bg-white border border-[#efe8dc] hover:border-[#FF6F61]/40 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-20px_rgba(120,80,40,0.35)]'
              } ${item.ready ? '' : 'opacity-70'}`}
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute -right-3 -bottom-8 font-display font-bold leading-none select-none transition-transform duration-500 group-hover:-translate-y-1 ${
                  featured ? 'text-[11rem] text-[#FF6F61]/[0.09]' : 'text-[8rem] text-[#FF6F61]/[0.07]'
                }`}
              >
                {GLYPHS[i]}
              </span>
              <div className="relative flex items-center justify-between gap-3">
                <Icon className={`w-6 h-6 ${'text-[#FF6F61]'}`} strokeWidth={1.75} />
                <span
                  className={`transition-all duration-300 group-hover:translate-x-0.5 ${
                    'text-stone-300 group-hover:text-[#FF6F61]'
                  }`}
                  aria-hidden
                >
                  →
                </span>
              </div>
              <h2 className={`relative mt-auto pt-8 font-display font-semibold ${featured ? 'text-2xl md:text-3xl text-stone-900' : 'text-xl text-stone-900'}`}>
                {item.title}
              </h2>
              <p className={`relative mt-2 text-sm leading-relaxed max-w-md ${'text-stone-500'}`}>{item.desc}</p>
            </div>
          );
          return item.ready ? (
            <Link key={item.href} href={withLocale(locale, item.href)} className={`${SPANS[i] ?? 'sm:col-span-3 lg:col-span-2'} rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6F61] focus-visible:ring-offset-2`}>
              {inner}
            </Link>
          ) : (
            <div key={item.href} className={SPANS[i] ?? 'sm:col-span-3 lg:col-span-2'}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
