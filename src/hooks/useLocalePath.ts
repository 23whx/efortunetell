'use client';

import { useParams, usePathname } from 'next/navigation';
import { defaultLocale, isLocale, withLocale, type Locale } from '@/lib/i18n/config';

export function useLocale(): Locale {
  const params = useParams();
  const pathname = usePathname();
  const fromParams = params?.locale;
  if (typeof fromParams === 'string' && isLocale(fromParams)) return fromParams;
  const seg = pathname.split('/').filter(Boolean)[0];
  if (seg && isLocale(seg)) return seg;
  return defaultLocale;
}

/** Build a path under the current URL locale */
export function useLocalePath() {
  const locale = useLocale();
  return (path: string = '/') => withLocale(locale, path);
}
