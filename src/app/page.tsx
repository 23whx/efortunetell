'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 立即重定向到博客页面
    router.replace('/blog');
  }, [router]);

  // 在重定向期间显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFACD]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#FF6F61] font-medium">正在跳转到博客...</p>
      </div>
    </div>
  );
}
