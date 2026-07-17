import type { Metadata } from 'next';
import { defaultLocale, localeOgLocale, locales, type Locale, withLocale } from './config';

const SITE_URL = 'https://efortunetell.blog';

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
}): Metadata {
  const { locale, path, title, description, keywords } = opts;
  const url = absoluteUrl(locale, path);
  return {
    title,
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
      siteName: 'Rollkey Divination Blog',
      locale: localeOgLocale[locale],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
