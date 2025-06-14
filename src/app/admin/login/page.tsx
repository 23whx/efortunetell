'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const admin = localStorage.getItem('admin');
      if (admin) {
        router.replace('/admin/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // 使用本地API代理
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 检查用户角色是否为admin
        const isAdmin = data.data && 
                       (data.data.user ? data.data.user.role === 'admin' : data.data.role === 'admin');
        
        if (isAdmin) {
          // 确认是管理员角色，保存到localStorage
          const adminData = {
            username: data.data.user ? data.data.user.username : (data.data.username || username),
            token: data.token,
            role: 'admin'  // 明确指定角色为admin
          };
          
          // 添加调试信息
          console.log('保存管理员信息到localStorage:', adminData);
          
          localStorage.setItem('admin', JSON.stringify(adminData));
          router.push('/admin/dashboard');
        } else {
          setError('此账号不是管理员账号，请使用管理员账号登录');
        }
      } else {
        console.error('登录请求失败:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          response: data
        });
        setError(data.message || t('user.login.error'));
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError(t('error.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">{t('admin.login.title')}</h1>
        {error && (
          <div className="mb-4 p-2 bg-[#FF6F61]/10 text-[#FF6F61] text-sm rounded border border-[#FF6F61]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="admin-username">{t('common.username')}</label>
            <Input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="请输入管理员账号"
            />
          </div>
          <div className="mb-6 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="admin-password">{t('common.password')}</label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="请输入密码"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') + '...' : t('common.login')}
          </Button>
        </form>
      </div>
    </div>
  );
}