import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import { getAlmanacDay, parseDateKey } from '@/lib/paipan/almanac';
import AlmanacClient from '@/components/tools/AlmanacClient';

type Props = { params: Promise<{ locale: string; date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, date } = await params;
  if (!isLocale(raw) || !parseDateKey(date)) return {};
  const day = getAlmanacDay(date);
  if (!day) return {};

  const titles: Record<Locale, string> = {
    en: `Chinese Almanac ${date} — ${day.lunar.full}`,
    zh: `${date} 老黄历 · ${day.lunar.full}`,
    ja: `${date} 万年暦 · ${day.lunar.full}`,
    ko: `${date} 만년력 · ${day.lunar.full}`,
    ar: `التقويم ${date} — ${day.lunar.full}`,
  };
  const descs: Record<Locale, string> = {
    en: `${date}: yi ${day.yi.slice(0, 5).join(', ')}; ji ${day.ji.slice(0, 3).join(', ')}. Pillars ${day.pillars.year.ganZhi} ${day.pillars.month.ganZhi} ${day.pillars.day.ganZhi}.`,
    zh: `${date}（${day.lunar.full}）宜${day.yi.slice(0, 6).join('、')}；忌${day.ji.slice(0, 4).join('、')}。日柱${day.pillars.day.ganZhi}，冲${day.chong}。`,
    ja: `${date} ${day.lunar.full} の吉凶・干支情報。`,
    ko: `${date} ${day.lunar.full} 길흉·간지 정보.`,
    ar: `${date} ${day.lunar.full}`,
  };

  return buildPageMetadata({
    locale: raw,
    path: `/tools/almanac/${date}`,
    image: 'almanac',
    title: titles[raw],
    description: descs[raw],
    keywords: [date, '万年历', '老黄历', day.pillars.day.ganZhi, ...day.yi.slice(0, 5)],
  });
}

export default async function AlmanacDatePage({ params }: Props) {
  const { locale: raw, date } = await params;
  if (!isLocale(raw) || !parseDateKey(date)) notFound();
  const day = getAlmanacDay(date);
  if (!day) notFound();
  return <AlmanacClient locale={raw} initialDate={date} initialDay={day} />;
}
