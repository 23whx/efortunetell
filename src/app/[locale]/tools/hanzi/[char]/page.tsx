import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, withLocale, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/seo';
import { getHanzi } from '@/lib/paipan/naming';

type Props = { params: Promise<{ locale: string; char: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, char: rawChar } = await params;
  if (!isLocale(raw)) return {};
  const char = decodeURIComponent(rawChar).slice(0, 1);
  const h = getHanzi(char);
  const titles: Record<Locale, string> = {
    en: h
      ? `Chinese character ${char} — strokes, wuxing, radical`
      : `Character ${char}`,
    zh: h
      ? `汉字「${char}」· 康熙${h.kangxi}画 · 五行${h.wuxing}`
      : `汉字「${char}」`,
    ja: `漢字「${char}」`,
    ko: `한자 「${char}」`,
    ar: `الحرف ${char}`,
  };
  const descs: Record<Locale, string> = {
    en: h
      ? `${char}: Kangxi strokes ${h.kangxi}, wuxing ${h.wuxing}, radical ${h.radical}, structure ${h.structure}.`
      : `${char} character lookup.`,
    zh: h
      ? `${char}：康熙笔画${h.kangxi}，五行${h.wuxing}，部首${h.radical}，结构${h.structure}。`
      : `${char} 汉字属性查询。`,
    ja: h ? `${char} の属性` : char,
    ko: h ? `${char} 속성` : char,
    ar: char,
  };
  return buildPageMetadata({
    locale: raw,
    path: `/tools/hanzi/${encodeURIComponent(char)}`,
    title: titles[raw],
    description: descs[raw],
    keywords: [char, '康熙笔画', '五行', '部首', '汉字'],
  });
}

export default async function HanziPage({ params }: Props) {
  const { locale: raw, char: rawChar } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const char = decodeURIComponent(rawChar).slice(0, 1);
  const h = getHanzi(char);

  const labels: Record<Locale, Record<string, string>> = {
    en: {
      back: 'Naming tools',
      kangxi: 'Kangxi strokes',
      modern: 'Modern strokes',
      wuxing: 'Wuxing',
      radical: 'Radical',
      structure: 'Structure',
      missing: 'Not in local table yet.',
    },
    zh: {
      back: '起名工具',
      kangxi: '康熙笔画',
      modern: '现代笔画',
      wuxing: '五行',
      radical: '部首',
      structure: '结构',
      missing: '本地字库暂无此字，可换常用字查询。',
    },
    ja: {
      back: '命名',
      kangxi: '康熙画数',
      modern: '画数',
      wuxing: '五行',
      radical: '部首',
      structure: '構造',
      missing: 'データなし',
    },
    ko: {
      back: '작명',
      kangxi: '강희 획수',
      modern: '현대 획수',
      wuxing: '오행',
      radical: '부수',
      structure: '구조',
      missing: '데이터 없음',
    },
    ar: {
      back: 'التسمية',
      kangxi: 'خطوط',
      modern: 'حديث',
      wuxing: 'عناصر',
      radical: 'جذر',
      structure: 'بنية',
      missing: 'غير موجود',
    },
  };
  const L = labels[locale];

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link
        href={withLocale(locale, '/tools/naming')}
        className="text-sm text-gray-500 hover:text-[#FF6F61]"
      >
        ← {L.back}
      </Link>
      <div className="mt-6 rounded-3xl bg-white border border-amber-100 shadow-sm p-8 text-center">
        <div className="text-7xl font-black text-gray-900">{char}</div>
        {h ? (
          <dl className="mt-8 grid grid-cols-1 gap-2 text-left text-sm">
            <div className="flex justify-between px-3 py-2 rounded-xl bg-amber-50/70">
              <dt className="text-gray-500">{L.kangxi}</dt>
              <dd className="font-bold">{h.kangxi}</dd>
            </div>
            <div className="flex justify-between px-3 py-2 rounded-xl bg-amber-50/70">
              <dt className="text-gray-500">{L.modern}</dt>
              <dd className="font-bold">{h.modern}</dd>
            </div>
            <div className="flex justify-between px-3 py-2 rounded-xl bg-amber-50/70">
              <dt className="text-gray-500">{L.wuxing}</dt>
              <dd className="font-bold">{h.wuxing}</dd>
            </div>
            <div className="flex justify-between px-3 py-2 rounded-xl bg-amber-50/70">
              <dt className="text-gray-500">{L.radical}</dt>
              <dd className="font-bold">{h.radical}</dd>
            </div>
            <div className="flex justify-between px-3 py-2 rounded-xl bg-amber-50/70">
              <dt className="text-gray-500">{L.structure}</dt>
              <dd className="font-bold">{h.structure}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-6 text-gray-400 text-sm">{L.missing}</p>
        )}
      </div>
    </div>
  );
}
