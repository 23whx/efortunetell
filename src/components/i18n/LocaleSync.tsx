'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/i18n/config';

/**
 * Remember the URL locale in the NEXT_LOCALE cookie (used when redirecting locale-less URLs).
 * The UI language itself is derived from the URL by LanguageProvider, so nothing to sync here.
 */
export function LocaleSync({ locale }: { locale: Locale; htmlLang?: string }) {
  useEffect(() => {
    try {
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* ignore */
    }
  }, [locale]);

  return null;
}
