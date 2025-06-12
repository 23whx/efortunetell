"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminSidebarProps {
  activeItem: 'articles' | 'comments' | 'appointments' | 'images';
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
          fixed z-30 top-0 left-0 h-full w-56 bg-white/95 border-r border-[#FF6F61] flex flex-col pt-32 pb-6 px-3 gap-4
          shadow-xl rounded-r-2xl transition-transform duration-300 backdrop-blur-sm
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-56 md:flex md:shadow-none md:rounded-none md:bg-white md:backdrop-blur-0
        `}
        style={{ minWidth: '14rem', maxWidth: '14rem' }}
      >
        <Button
          className={`w-full text-black font-semibold transition-all duration-300 rounded-lg py-2 ${activeItem === 'articles' ? 'bg-[#FF6F61] !text-black shadow-md' : 'bg-white !text-black border border-[#FF6F61]'}`}
          onClick={() => { router.push('/admin/articles'); setSidebarOpen(false); }}
        >
          {t('common.articles')}
        </Button>
        <Button
          className={`w-full text-black font-semibold transition-all duration-300 rounded-lg py-2 ${activeItem === 'comments' ? 'bg-[#FF6F61] !text-black shadow-md' : 'bg-white !text-black border border-[#FF6F61]'}`}
          onClick={() => { router.push('/admin/comments'); setSidebarOpen(false); }}
        >
          {t('common.comments')}
        </Button>
        <Button
          className={`w-full text-black font-semibold transition-all duration-300 rounded-lg py-2 ${activeItem === 'appointments' ? 'bg-[#FF6F61] !text-black shadow-md' : 'bg-white !text-black border border-[#FF6F61]'}`}
          onClick={() => { router.push('/admin/appointments'); setSidebarOpen(false); }}
        >
          {t('common.appointments')}
        </Button>
        <Button
          className={`w-full text-black font-semibold transition-all duration-300 rounded-lg py-2 ${activeItem === 'images' ? 'bg-[#FF6F61] !text-black shadow-md' : 'bg-white !text-black border border-[#FF6F61]'}`}
          onClick={() => { router.push('/admin/images'); setSidebarOpen(false); }}
        >
          {t('admin.sidebar.images')}
        </Button>
        
        <div className="mt-auto">
          <Button
            className="w-full bg-white !text-black border border-[#FF6F61] font-semibold transition-all duration-300 rounded-lg py-2"
            onClick={() => router.push('/admin/dashboard')}
          >
            {t('common.back')}
          </Button>
        </div>
      </aside>
    </>
  );
} 