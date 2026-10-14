'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Language } from '@/lib/i18n/detect';
import { translations } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = 'en',
  useStoredLanguage = false,
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
  /** Only for routes without a locale in the URL (admin): restore the last chosen language. On /{locale} routes the URL wins. */
  useStoredLanguage?: boolean;
}) {
  // Admin (no locale in URL): language lives in state + localStorage.
  const [storedLanguage, setStoredLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    if (!useStoredLanguage || typeof window === 'undefined') return;
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['zh', 'en', 'ja', 'ko', 'ar'].includes(savedLanguage)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
      setStoredLanguage(savedLanguage);
    }
  }, [useStoredLanguage]);

  // /{locale} routes: the language is derived from the URL (the layout re-renders with the new locale on
  // navigation), so UI text and page content switch in the same commit — no intermediate state to flash.
  const language = useStoredLanguage ? storedLanguage : initialLanguage;

  const setLanguage = (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
    if (useStoredLanguage) setStoredLanguage(lang);
  };

  const t = useMemo(() => {
    const dict = (translations as any)[language] as Record<string, string> | undefined;
    const enDict = (translations as any).en as Record<string, string> | undefined;
    return (key: string) => dict?.[key] ?? enDict?.[key] ?? key;
  }, [language]);

  // Sync html lang + dir (Arabic RTL)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
