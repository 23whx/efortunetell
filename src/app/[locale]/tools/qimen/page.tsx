import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import ToolJsonLd from '@/components/seo/ToolJsonLd';
import ToolGuide from '@/components/seo/ToolGuide';
import QimenClient from '@/components/tools/QimenClient';

const META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Qi Men Dun Jia Calculator: Free Yin Pan Qimen Chart',
    description:
      'Free Qi Men Dun Jia (Qimen Dunjia) calculator for any hour: Yin Pan or Chaibu ju number, earth and heaven plates, value star and door, and the nine palaces with stars, doors and deities.',
  },
  zh: {
    title: '阴盘奇门遁甲排盘',
    description:
      '免费时家阴盘奇门排盘：阴阳遁局数、三元、地盘天盘、值符值使、九宫星门神、马星空亡。默认拆补法，前端本地计算。',
  },
  ja: {
    title: '陰盤奇門遁甲',
    description: '時家陰盤奇門の盤をブラウザで計算。',
  },
  ko: {
    title: '음반 기문둔갑',
    description: '시가 음반 기문 명반을 브라우저에서 계산합니다.',
  },
  ar: {
    title: 'تشي من دونجيا (يين بان)',
    description: 'مخطط تشي من بالساعة — حساب محلي.',
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
    path: '/tools/qimen',
    image: 'qimen',
    title: m.title,
    description: m.description,
    keywords: ['Qimen', 'Qi Men Dunjia', '阴盘奇门', '奇门遁甲', '值符', '值使'],
  });
}

export default async function QimenToolPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return (
    <>
      <ToolJsonLd locale={raw} path="/tools/qimen" name={META[raw].title} description={META[raw].description} image="qimen" />
      <QimenClient locale={raw} />
      <ToolGuide tool="qimen" locale={raw} />
    </>
  );
}
