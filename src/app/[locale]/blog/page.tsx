import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { absoluteUrl, buildLanguageAlternates, buildPageMetadata } from '@/lib/i18n/seo';
import { getPublishedArticles } from '@/lib/blog/list';
import BlogList from '@/components/blog/BlogList';

export const revalidate = 600;

type Props = { params: Promise<{ locale: string }> };

const META: Record<Locale, { title: string; description: string }> = {
  en: { title: 'Chinese Metaphysics Blog: BaZi, Qimen & Da Liu Ren Articles', description: 'Articles on BaZi (Four Pillars), Ten Gods, chart structures, Yin Pan Qimen Dunjia, Da Liu Ren, date selection and name selection.' },
  zh: { title: '命理文章：八字十神、奇门遁甲、大六壬、择日', description: '原创命理文章：八字十神、格局用神、性格与职业分析，阴盘奇门、大六壬断事与择日起名经验。' },
  ja: { title: '中国命理ブログ：四柱推命・奇門遁甲・大六壬', description: '四柱推命の十神・格局、陰盤奇門遁甲、大六壬、択日についての記事（中国語）。' },
  ko: { title: '명리 블로그: 사주팔자·기문둔갑·대육임', description: '사주 십신·격국, 음반 기문둔갑, 대육임, 택일에 관한 칼럼(중국어).' },
  ar: { title: 'مدونة الميتافيزيقا الصينية: بازي وتشي من', description: 'مقالات عن بازي (الأعمدة الأربعة) وتشي من دون جيا ودا ليو رن (باللغة الصينية).' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const meta = buildPageMetadata({ locale: raw, path: '/blog', ...META[raw] });
  // Same list as the homepage — consolidate ranking signals on the homepage URL
  return { ...meta, alternates: { canonical: absoluteUrl(raw, '/'), languages: buildLanguageAlternates('/') } };
}

export default async function BlogPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <BlogList initialArticles={await getPublishedArticles()} />;
}
