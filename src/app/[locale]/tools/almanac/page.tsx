import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import ToolJsonLd from '@/components/seo/ToolJsonLd';
import { getAlmanacDay, todayDateKey } from '@/lib/paipan/almanac';
import AlmanacClient from '@/components/tools/AlmanacClient';

// "Today" is computed at render time — regenerate hourly so the page never shows a stale date
export const revalidate = 3600;

const META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Chinese Almanac (Wan Nian Li / Tong Shu)',
    description:
      'Free Chinese traditional almanac: lunar calendar, four pillars, yi and ji, chong-sha, twenty-eight mansions, jianchu, hour fortunes and solar terms.',
  },
  zh: {
    title: '万年历 / 老黄历查询',
    description:
      '免费在线万年历老黄历：农历、四柱干支、每日宜忌、冲煞、建除十二神、二十八宿、时辰吉凶、节气与方位神煞。',
  },
  ja: {
    title: '中国万年暦・通書',
    description: '旧暦、干支、吉凶、二十八宿、節気などを確認できる万年暦。',
  },
  ko: {
    title: '만년력 / 통서',
    description: '음력, 간지, 길흉, 이십팔수, 절기 정보를 확인하세요.',
  },
  ar: {
    title: 'التقويم الصيني التقليدي',
    description: 'التقويم القمري الصيني والطالع اليومي والساعات الميمونة.',
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
    path: '/tools/almanac',
    image: 'almanac',
    title: m.title,
    description: m.description,
    keywords: [
      'Chinese almanac',
      'Tong Shu',
      'Wan Nian Li',
      '万年历',
      '老黄历',
      '宜忌',
      '农历',
    ],
  });
}

export default async function AlmanacPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const date = todayDateKey();
  const day = getAlmanacDay(date);
  if (!day) notFound();

  return (
    <>
      <ToolJsonLd locale={locale} path="/tools/almanac" name={META[locale].title} description={META[locale].description} image="almanac" />
      <AlmanacClient locale={locale} initialDate={date} initialDay={day} />
    </>
  );
}
