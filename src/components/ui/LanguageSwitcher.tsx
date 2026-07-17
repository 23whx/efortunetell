'use client';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import type { Language } from '@/lib/i18n/detect';
import { usePathname, useRouter } from 'next/navigation';
import { isLocale, locales, stripLocale, withLocale, type Locale } from '@/lib/i18n/config';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const onChange = (lang: Language) => {
    setLanguage(lang);
    try {
      document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* ignore */
    }

    const seg = pathname.split('/').filter(Boolean)[0];
    if (seg && isLocale(seg)) {
      const rest = stripLocale(pathname);
      router.push(withLocale(lang as Locale, rest));
      return;
    }
    // Non-locale routes (admin etc.): just switch UI language
  };

  return (
    <div className="flex items-center gap-1 xl:gap-2">
      <Globe size={16} className="text-gray-600 flex-shrink-0 hidden lg:block" />
      <select
        value={language}
        onChange={(e) => onChange(e.target.value as Language)}
        className="bg-transparent border border-gray-300 rounded px-1 lg:px-2 py-1 text-xs lg:text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6F61] cursor-pointer hover:border-[#FF6F61]/50 transition-colors"
        aria-label="Language"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {l === 'en'
              ? 'English'
              : l === 'zh'
                ? '中文'
                : l === 'ja'
                  ? '日本語'
                  : l === 'ko'
                    ? '한국어'
                    : 'العربية'}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
