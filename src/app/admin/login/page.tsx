'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { API_ROUTES } from '@/config/api';

export default function AdminLoginPage() {
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
      // 发送登录请求，完全匹配后端接口期望的格式
      const response = await fetch(API_ROUTES.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password
          // 移除role字段，后端不需要
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 检查用户角色是否为admin
        const isAdmin = data.data && 
                       (data.data.user ? data.data.user.role === 'admin' : data.data.role === 'admin');
        
        if (isAdmin) {
          // 确认是管理员角色，保存到localStorage
          localStorage.setItem('admin', JSON.stringify({
            username: data.data.user ? data.data.user.username : (data.data.username || username),
            token: data.token
          }));
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
        setError(data.message || '登录失败，请确认账号和密码');
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">管理员登录</h1>
        {error && (
          <div className="mb-4 p-2 bg-[#FF6F61]/10 text-[#FF6F61] text-sm rounded border border-[#FF6F61]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="admin-username">用户名</label>
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
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="admin-password">密码</label>
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
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>
      </div>
    </div>
  );
}