"use client";
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { FileText, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-4">{t('admin.dashboard.title')}</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">{t('admin.sidebar.management')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            className="group relative bg-white rounded-[40px] border border-gray-100 p-10 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 cursor-pointer overflow-hidden"
            onClick={() => router.push('/admin/articles')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6F61]/5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-[#FF6F61]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <FileText className="w-8 h-8 text-[#FF6F61]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">{t('common.articles')}</h2>
              <p className="text-gray-400 font-bold leading-relaxed mb-8">{t('admin.dashboard.articlesDesc')}</p>
              <div className="flex items-center text-[#FF6F61] font-black text-xs uppercase tracking-widest gap-2">
                {t('admin.dashboard.enter')} <span className="text-lg">→</span>
              </div>
            </div>
          </div>
          
          <div 
            className="group relative bg-white rounded-[40px] border border-gray-100 p-10 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 cursor-pointer overflow-hidden"
            onClick={() => router.push('/admin/appointments')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6F61]/5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-[#FF6F61]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Calendar className="w-8 h-8 text-[#FF6F61]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-4">{t('common.appointments')}</h2>
              <p className="text-gray-400 font-bold leading-relaxed mb-8">{t('admin.dashboard.appointmentsDesc')}</p>
              <div className="flex items-center text-[#FF6F61] font-black text-xs uppercase tracking-widest gap-2">
                {t('admin.dashboard.enter')} <span className="text-lg">→</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 flex justify-center">
          <button 
            className="group px-12 py-5 rounded-[32px] bg-[#FF6F61] text-white font-black shadow-2xl shadow-[#FF6F61]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            onClick={() => router.push('/admin/write')}
          >
            <span className="text-lg tracking-widest uppercase">{t('admin.dashboard.writeNew')}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
              <span className="text-xl">+</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
} 