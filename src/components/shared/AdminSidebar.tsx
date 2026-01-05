"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminSidebarProps {
  activeItem: 'articles' | 'appointments';
}

export default function AdminSidebar({ activeItem }: AdminSidebarProps) {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* 弹出按钮，仅小屏显示 */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden bg-[#FF6F61] text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label={t('admin.sidebar.expand')}
        style={{ display: sidebarOpen ? 'none' : 'block' }}
      >
        <Menu size={24} />
      </button>
      
      {/* 遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* 侧边栏本体 */}
      <aside
        className={`
          fixed z-30 top-16 md:top-20 left-0 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-64 bg-white border-r border-gray-100 flex flex-col pt-8 pb-6 px-4 gap-2
          shadow-xl transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:shadow-none md:bg-[#faf9f6]/50 md:backdrop-blur-xl
        `}
      >
        <div className="px-2 mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF6F61] flex items-center justify-center shadow-lg shadow-[#FF6F61]/20">
              <span className="text-white font-black text-xs">R</span>
            </div>
            <span className="font-black text-sm tracking-widest text-gray-900 uppercase">{t('admin.sidebar.panel')}</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase pl-11">{t('admin.sidebar.management')}</p>
        </div>

        <nav className="space-y-2">
          <button
          onClick={() => { router.push('/admin/articles'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
              activeItem === 'articles' 
                ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${activeItem === 'articles' ? 'bg-white' : 'bg-gray-300'}`} />
          {t('common.articles')}
          </button>

          <button
          onClick={() => { router.push('/admin/appointments'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
              activeItem === 'appointments' 
                ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${activeItem === 'appointments' ? 'bg-white' : 'bg-gray-300'}`} />
          {t('common.appointments')}
          </button>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-gray-100">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            {t('common.back')}
          </button>
        </div>
      </aside>
    </>
  );
} 