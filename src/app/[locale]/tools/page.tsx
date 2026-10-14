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
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{c.title}</h1>
      <div className="w-12 h-[3px] bg-[#FF6F61] mt-5 rounded-full" />
      <p className="mt-5 text-gray-500 max-w-2xl leading-relaxed">{c.desc}</p>
      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        {c.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          const inner = (
            <div
              className={`group rounded-2xl border p-7 h-full transition-all duration-300 ${
                item.ready
                  ? 'bg-white border-[#f0ece3] hover:border-[#FF6F61]/30 hover:shadow-md'
                  : 'bg-white/60 border-[#f0ece3] opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <Icon className="w-6 h-6 text-[#FF6F61]" strokeWidth={1.75} />
                <span className="text-gray-300 group-hover:text-[#FF6F61] group-hover:translate-x-0.5 transition-all duration-300">
                  →
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold text-gray-900 group-hover:text-[#FF6F61] transition-colors">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          );
          return item.ready ? (
            <Link key={item.href} href={withLocale(locale, item.href)}>
              {inner}
            </Link>
          ) : (
            <div key={item.href}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
