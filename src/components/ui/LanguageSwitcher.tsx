'use client';
import React, { useState, useTransition } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import type { Language } from '@/lib/i18n/detect';
import { usePathname, useRouter } from 'next/navigation';
import { isLocale, locales, stripLocale, withLocale, type Locale } from '@/lib/i18n/config';

const LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Show the chosen language immediately while the new page loads
  const [chosen, setChosen] = useState<Language | null>(null);

  const seg = pathname.split('/').filter(Boolean)[0];
  const onLocaleRoute = Boolean(seg && isLocale(seg));

  /** Same page in another language, keeping ?query and #hash */
  const targetFor = (lang: Locale) => {
    const suffix = typeof window !== 'undefined' ? window.location.search + window.location.hash : '';
    return withLocale(lang, stripLocale(pathname)) + suffix;
  };

  // Warm the other language versions as soon as the user reaches for the switcher
  const prefetchAll = () => {
    if (!onLocaleRoute) return;
    for (const l of locales) if (l !== language) router.prefetch(withLocale(l, stripLocale(pathname)));
  };

  const onChange = (lang: Language) => {
    try {
      document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000;samesite=lax`;
      localStorage.setItem('language', lang);
    } catch {
      /* ignore */
    }

    if (onLocaleRoute) {
      setChosen(lang);
      // The URL decides the language: navigate, and the whole page (UI + content) swaps in one commit.
      // Inside a transition the current page stays fully interactive until the new one is ready.
      startTransition(() => router.push(targetFor(lang as Locale), { scroll: false }));
      return;
    }
    // Non-locale routes (admin etc.): just switch UI language
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-1 xl:gap-2">
      <Globe
        size={16}
        className={`text-gray-600 flex-shrink-0 hidden lg:block transition-opacity ${pending ? 'animate-pulse opacity-60' : ''}`}
      />
      <select
        value={pending && chosen ? chosen : language}
        onChange={(e) => onChange(e.target.value as Language)}
        onPointerEnter={prefetchAll}
        onFocus={prefetchAll}
        disabled={pending}
        aria-busy={pending}
        className="bg-transparent border border-gray-300 rounded px-1 lg:px-2 py-1 text-xs lg:text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6F61] cursor-pointer hover:border-[#FF6F61]/50 transition-colors disabled:cursor-wait"
        aria-label="Language"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {LABELS[l]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
