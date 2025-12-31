'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import AIChatBox from '@/components/rag/AIChatBox';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Brain, BookOpen, Zap } from 'lucide-react';

export default function AIChatPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFACD] via-[#FFF5E1] to-[#FFFACD] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FF6F61] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">{t('common.back')}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6F61] to-[#FF8A7A] mb-6 shadow-lg">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            {t('rag.pageTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('rag.pageSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Features */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FF6F61]/10 flex items-center justify-center mb-4">
              <Brain size={24} className="text-[#FF6F61]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('rag.feature1Title')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('rag.feature1Desc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FF6F61]/10 flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-[#FF6F61]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('rag.feature2Title')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('rag.feature2Desc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#FF6F61]/10 flex items-center justify-center mb-4">
              <Zap size={24} className="text-[#FF6F61]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('rag.feature3Title')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('rag.feature3Desc')}
            </p>
          </div>
        </div>

        {/* Chat Box */}
        <div className="max-w-4xl mx-auto">
          <AIChatBox />
        </div>

        {/* Tips */}
        <div className="max-w-4xl mx-auto mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-blue-600">💡</span>
            {t('rag.tipsTitle')}
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• {t('rag.tip1')}</li>
            <li>• {t('rag.tip2')}</li>
            <li>• {t('rag.tip3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

