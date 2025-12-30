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
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    // 从 localStorage 读取语言设置（用户手动选择优先级最高）
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['zh', 'en', 'ja', 'ko', 'ar'].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
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
