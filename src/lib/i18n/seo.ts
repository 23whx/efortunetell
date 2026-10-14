import type { Metadata } from 'next';
import { defaultLocale, localeOgLocale, locales, type Locale, withLocale } from './config';
import { OG_IMAGES, SITE_NAME, SITE_URL, type OgImageKey } from '@/lib/site';

/** Home / site-wide title + description per locale (targets the main search terms in each language) */
export const SITE_COPY: Record<Locale, { title: string; description: string; keywords: string[] }> = {
  en: {
    title: 'Free BaZi Calculator, Qimen Dunjia & Chinese Almanac | 旭通命理小站',
    description:
      'Free online BaZi (Four Pillars of Destiny) charts, Yin Pan Qimen Dunjia, Da Liu Ren, a daily Chinese almanac (Tong Shu), name selection, and in-depth Chinese metaphysics articles.',
    keywords: ['BaZi calculator', 'Four Pillars of Destiny', 'Chinese astrology', 'Qimen Dunjia', 'Da Liu Ren', 'Chinese almanac', 'Tong Shu', 'Chinese metaphysics', 'fortune telling'],
  },
  zh: {
    title: '八字排盘·奇门遁甲·大六壬·老黄历 | 旭通命理小站',
    description:
      '免费在线八字排盘、阴盘奇门遁甲、大六壬起课、万年历老黄历与八字起名工具，以及十神、格局、用神、择日等原创命理文章。',
    keywords: ['八字排盘', '八字算命', '四柱八字', '奇门遁甲', '阴盘奇门', '大六壬', '老黄历', '万年历', '八字起名', '十神', '命理'],
  },
  ja: {
    title: '無料 四柱推命・奇門遁甲・大六壬・万年暦 | 旭通命理小站',
    description:
      '無料の四柱推命（八字）命式作成、陰盤奇門遁甲、大六壬、万年暦（通書）、命名ツールと中国命理学の解説記事。',
    keywords: ['四柱推命', '八字', '奇門遁甲', '大六壬', '万年暦', '中国占術'],
  },
  ko: {
    title: '무료 사주팔자·기문둔갑·대육임·만세력 | 旭通命理小站',
    description:
      '무료 사주팔자 명식, 음반 기문둔갑, 대육임, 만세력(통서), 작명 도구와 중국 명리학 칼럼을 제공합니다.',
    keywords: ['사주팔자', '사주 명식', '기문둔갑', '대육임', '만세력', '명리학'],
  },
  ar: {
    title: 'حاسبة بازي مجانية، تشي من دون جيا والتقويم الصيني | 旭通命理小站',
    description:
      'مخططات بازي (الأعمدة الأربعة للقدر) مجانية، وتشي من دون جيا، ودا ليو رن، والتقويم الصيني اليومي، ومقالات في الميتافيزيقا الصينية.',
    keywords: ['بازي', 'الأعمدة الأربعة', 'التنجيم الصيني', 'تشي من دون جيا', 'التقويم الصيني'],
  },
};

export function absoluteUrl(locale: Locale, path: string = '/'): string {
  return `${SITE_URL}${withLocale(locale, path)}`;
}

export function buildLanguageAlternates(path: string = '/'): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of locales) {
    map[locale === 'zh' ? 'zh-CN' : locale] = absoluteUrl(locale, path);
  }
  map['x-default'] = absoluteUrl(defaultLocale, path);
  return map;
}

export function buildPageMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: OgImageKey;
  /** Use `{ absolute }` to skip the "| site name" title template */
  absoluteTitle?: boolean;
}): Metadata {
  const { locale, path, title, description, keywords, image = 'default', absoluteTitle } = opts;
  const url = absoluteUrl(locale, path);
  const ogImage = { url: OG_IMAGES[image], width: 1200, height: 630, alt: title };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: localeOgLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeOgLocale[l]),
      type: 'website',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Rollkey4',
      creator: '@Rollkey4',
      title,
      description,
      images: [ogImage.url],
    },
  };
}
