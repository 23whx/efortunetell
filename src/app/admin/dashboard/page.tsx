"use client";
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { FileText, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFACD] flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8 mb-8">
        <h1 className="text-3xl font-bold text-[#FF6F61] mb-8 text-center">{t('admin.dashboard.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            className="border border-[#FF6F61] rounded-lg p-6 bg-[#FFFACD] hover:shadow-lg transition-all cursor-pointer flex flex-col items-center"
            onClick={() => router.push('/admin/articles')}
          >
            <FileText size={50} className="text-[#FF6F61] mb-4" />
            <h2 className="text-xl font-bold text-[#FF6F61] mb-2">{t('common.articles')}</h2>
            <p className="text-gray-700 text-center">创建、编辑、删除文章</p>
          </div>
          
          <div 
            className="border border-[#FF6F61] rounded-lg p-6 bg-[#FFFACD] hover:shadow-lg transition-all cursor-pointer flex flex-col items-center"
            onClick={() => router.push('/admin/appointments')}
          >
            <Calendar size={50} className="text-[#FF6F61] mb-4" />
            <h2 className="text-xl font-bold text-[#FF6F61] mb-2">{t('common.appointments')}</h2>
            <p className="text-gray-700 text-center">管理用户提交的需求</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button 
            className="bg-[#FF6F61] text-white px-6 py-2" 
            onClick={() => router.push('/admin/write')}
          >
            写新文章
          </Button>
        </div>
      </div>
    </div>
  );
} 