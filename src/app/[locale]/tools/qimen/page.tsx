import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import QimenClient from '@/components/tools/QimenClient';

const META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Yin Pan Qi Men Dunjia Chart',
    description:
      'Free hour-based Yin Pan Qimen Dunjia charting: ju number, earth plate, value star/door, nine palaces with stars, doors and spirits. Chaibu method default.',
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
  return <QimenClient locale={raw} />;
}
