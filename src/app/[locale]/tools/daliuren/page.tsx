import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import ToolJsonLd from '@/components/seo/ToolJsonLd';
import DaliurenClient from '@/components/tools/DaliurenClient';

const META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Da Liu Ren Chart',
    description:
      'Free Da Liu Ren four-position charting: di fen, yue jiang, ren yuan, gui shen, jiang shen, void and motion flags. Local browser calculation.',
  },
  zh: {
    title: '大六壬排盘',
    description:
      '免费大六壬四位排盘：地分、月将、人元、贵神、将神、日空与五动三动。前端本地计算。',
  },
  ja: {
    title: '大六壬',
    description: '四位課式をブラウザで計算。',
  },
  ko: {
    title: '대육임',
    description: '사위 과식을 브라우저에서 계산합니다.',
  },
  ar: {
    title: 'دا ليو رن',
    description: 'مخطط المواضع الأربعة — حساب محلي.',
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
    path: '/tools/daliuren',
    image: 'daliuren',
    title: m.title,
    description: m.description,
    keywords: ['Da Liu Ren', '大六壬', '四位', '月将', '贵神', '将神'],
  });
}

export default async function DaliurenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return (
    <>
      <ToolJsonLd locale={raw} path="/tools/daliuren" name={META[raw].title} description={META[raw].description} image="daliuren" />
      <DaliurenClient locale={raw} />
    </>
  );
}
