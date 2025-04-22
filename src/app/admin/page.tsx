"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // 检查管理员是否登录
    const admin = localStorage.getItem('admin');
    if (admin) {
      // 如果已登录，重定向到仪表盘
      router.replace('/admin/dashboard');
    } else {
      // 如果未登录，重定向到登录页
      router.replace('/admin/login');
    }
  }, [router]);

  // 返回一个加载指示器，因为这个页面将立即重定向
  return (
    <div className="min-h-screen bg-[#FFFACD] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6F61]"></div>
    </div>
  );
} 