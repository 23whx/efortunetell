'use client';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import type { Language } from '@/lib/i18n/detect';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 xl:gap-2">
      <Globe size={16} className="text-gray-600 flex-shrink-0 hidden lg:block" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent border border-gray-300 rounded px-1 lg:px-2 py-1 text-xs lg:text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6F61] cursor-pointer hover:border-[#FF6F61]/50 transition-colors"
      >
        <option value="en">English</option>
        <option value="zh">中文</option>
        <option value="ja">日本語</option>
        <option value="ko">한국어</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher; 