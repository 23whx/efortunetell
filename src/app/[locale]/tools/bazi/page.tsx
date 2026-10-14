import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import ToolJsonLd from '@/components/seo/ToolJsonLd';
import ToolGuide from '@/components/seo/ToolGuide';
import BaziClient from '@/components/tools/BaziClient';

const META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Free BaZi Calculator: Chinese Birth Chart & Four Pillars of Destiny',
    description:
      'Free Chinese astrology calculator. Enter your birth date and time to get your BaZi chart (Four Pillars of Destiny): day master, hidden stems, Ten Gods, Na Yin and 10-year luck pillars, with exact solar-term boundaries and optional true solar time.',
  },
  zh: {
    title: '八字排盘（四柱）',
    description:
      '免费在线八字排盘：四柱、藏干、十神、纳音、空亡、司令、大运起运交运、出生节气。在浏览器本地计算，不上传出生信息。',
  },
  ja: {
    title: '四柱推命・八字排盤',
    description: '四柱・蔵干・十神・納音・空亡・大運をブラウザで計算。',
  },
  ko: {
    title: '사주팔자 명반',
    description: '사주, 장간, 십신, 납음, 공망, 대운을 브라우저에서 계산합니다.',
  },
  ar: {
    title: 'مخطط بازي (الأعمدة الأربعة)',
    description: 'حاسبة بازي مجانية: الأعمدة الأربعة والدورة الكبرى.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const m = META[raw];
  return buildPageMetadata({
    locale: raw,
    path: '/tools/bazi',
    image: 'bazi',
    title: m.title,
    description: m.description,
    keywords: raw === 'en'
      ? ['bazi calculator', 'chinese astrology calculator', 'bazi chart', 'four pillars of destiny calculator', 'chinese birth chart', 'day master']
      : ['BaZi', 'Four Pillars', '八字排盘', '四柱', '大运', '藏干', '十神'],
  });
}

export default async function BaziToolPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return (
    <>
      <ToolJsonLd locale={raw} path="/tools/bazi" name={META[raw].title} description={META[raw].description} image="bazi" />
      <BaziClient locale={raw} />
      <ToolGuide tool="bazi" locale={raw} />
    </>
  );
}
