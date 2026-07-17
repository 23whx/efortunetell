import type { Language } from './detect';

export const locales = ['en', 'zh', 'ja', 'ko', 'ar'] as const;
export type Locale = (typeof locales)[number];

/** Default language for SEO root and fallbacks */
export const defaultLocale: Locale = 'en';

export const localeHtmlLang: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
  ar: 'ar',
};

export const localeOgLocale: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  ar: 'ar_SA',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function toLanguage(locale: Locale): Language {
  return locale;
}

/** Paths that must NOT get a locale prefix */
export const LOCALE_EXCLUDED_PREFIXES = [
  '/api',
  '/admin',
  '/auth',
  '/_next',
  '/favicon.ico',
  '/icon.png',
  '/robots.txt',
  '/rss.xml',
  '/ads.txt',
  '/manifest.webmanifest',
  '/sitemap.xml',
] as const;

export function pathHasLocale(pathname: string): boolean {
  const seg = pathname.split('/').filter(Boolean)[0];
  return !!seg && isLocale(seg);
}

export function stripLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && isLocale(parts[0])) {
    const rest = parts.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function withLocale(locale: Locale, path: string = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/') return `/${locale}`;
  return `/${locale}${clean}`;
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg && isLocale(seg) ? seg : null;
}

/** Public path patterns that should be locale-prefixed (used by middleware redirects) */
export const PUBLIC_REDIRECT_PATHS = [
  '/',
  '/blog',
  '/tools',
  '/services',
  '/contact',
  '/donation',
  '/fortune',
  '/ai-chat',
  '/search',
  '/bazi-calculator',
  '/test-bazi',
  '/user',
  '/payment',
  '/articles',
] as const;
