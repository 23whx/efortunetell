import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import ToolJsonLd from '@/components/seo/ToolJsonLd';
import NamingClient from '@/components/tools/NamingClient';

const META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Chinese Naming & Character Lookup',
    description:
      'Smart Chinese baby names from BaZi xi-yong elements, plus Kangxi strokes, wuxing, radicals and structure lookup.',
  },
  zh: {
    title: '起名改名 · 汉字查询',
    description:
      '按八字喜用智能取名（双字优先、支持复姓），并查询康熙笔画、五行、部首与结构。',
  },
  ja: {
    title: '命名・漢字検索',
    description: '八字に基づく命名と漢字属性検索。',
  },
  ko: {
    title: '작명 · 한자 조회',
    description: '사주 희용 기반 작명과 한자 속성 조회.',
  },
  ar: {
    title: 'التسمية والبحث عن الحروف',
    description: 'أسماء صينية ذكية وبحث خصائص الحروف.',
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
    path: '/tools/naming',
    image: 'naming',
    title: m.title,
    description: m.description,
    keywords: ['起名', '改名', '康熙笔画', '五行', 'Chinese naming', 'BaZi'],
  });
}

export default async function NamingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return (
    <>
      <ToolJsonLd locale={raw} path="/tools/naming" name={META[raw].title} description={META[raw].description} image="naming" />
      <NamingClient locale={raw} />
    </>
  );
}
