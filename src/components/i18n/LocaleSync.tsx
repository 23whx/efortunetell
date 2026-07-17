'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Locale } from '@/lib/i18n/config';
import type { Language } from '@/lib/i18n/detect';

/** Keep LanguageContext + cookie in sync with URL locale */
export function LocaleSync({
  locale,
  htmlLang,
}: {
  locale: Locale;
  htmlLang: string;
}) {
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    if (language !== locale) {
      setLanguage(locale as Language);
    }
    try {
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* ignore */
    }
    document.documentElement.lang = htmlLang;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale, language, setLanguage, htmlLang]);

  return null;
}
