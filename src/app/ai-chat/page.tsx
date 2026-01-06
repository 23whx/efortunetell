'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import BaziConsultationBox from '@/components/ai-consultation/BaziConsultationBox';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, Brain, Zap } from 'lucide-react';

export default function AIChatPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFACD] via-[#FFF5E1] to-[#FFFACD] relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6F61]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4A90E2]/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#FF6F61] transition-all mb-12 group"
        >
          <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="font-bold tracking-widest uppercase text-xs">{t('common.back')}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6F61] to-[#FF8A7A] mb-8 shadow-xl shadow-[#FF6F61]/20 rotate-3">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F61] to-[#FF8A7A]">{t('rag.pageTitle')}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            {t('rag.pageSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
          {/* Features */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-xl shadow-gray-200/20 hover:scale-[1.02] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6F61]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain size={24} className="text-[#FF6F61]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t('rag.feature1Title')}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('rag.feature1Desc')}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-xl shadow-gray-200/20 hover:scale-[1.02] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#4A90E2]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield size={24} className="text-[#4A90E2]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t('rag.feature2Title')}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('rag.feature2Desc')}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-xl shadow-gray-200/20 hover:scale-[1.02] transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={24} className="text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {t('rag.feature3Title')}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('rag.feature3Desc')}
            </p>
          </div>
        </div>

        {/* Consultation Box */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#FF6F61] to-[#4A90E2] rounded-[3rem] blur-2xl opacity-10" />
          <BaziConsultationBox />
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto mt-16 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <span className="text-pink-500 text-lg">✨</span>
            </div>
            <h4 className="font-bold text-gray-900 text-lg">
              {t('rag.disclaimer.title')}
            </h4>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-pink-500/50 mt-1">●</span>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(`rag.disclaimer.${i}` as any)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 italic">
              {t('rag.donation.footer')}
            </p>
            <div className="flex gap-4">
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <div className="w-1 h-1 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

