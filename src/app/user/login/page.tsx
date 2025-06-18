'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { API_ROUTES } from '@/config/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserLoginPage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(API_ROUTES.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 保存token和用户信息到localStorage
        console.log('登录成功，后端返回数据:', data);
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('已写入token到localStorage:', data.token);
        } else {
          console.warn('后端未返回token');
        }
        if (data.data && data.data.user) {
          localStorage.setItem('user', JSON.stringify({
            username: data.data.user.username,
            _id: data.data.user._id
          }));
          console.log('已写入user到localStorage:', {
            username: data.data.user.username,
            _id: data.data.user._id
          });
        } else if (data.data && data.data.username) {
          localStorage.setItem('user', JSON.stringify({
            username: data.data.username
          }));
          console.log('已写入user到localStorage:', { 
            username: data.data.username
          });
        } else {
        localStorage.setItem('user', JSON.stringify({ 
            username: username
        }));
          console.log('已写入user到localStorage:', { 
            username
          });
        }
        router.push('/user/profile');
      } else {
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
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">{t('user.login.title')}</h1>
        
        {error && (
          <div className="mb-4 p-2 bg-[#FF6F61]/10 text-[#FF6F61] text-sm rounded border border-[#FF6F61]">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="username">{t('user.login.username')}</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="长度限制6-18个字符串"
            />
          </div>
          <div className="mb-6 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="password">{t('user.login.password')}</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="区分大小写，长度限制6-18个字符串"
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <Button 
              type="submit" 
              className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none px-8"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') + '...' : t('user.login.submit')}
            </Button>
            <a href="/user/forgot-password" className="text-[#FF6F61] text-sm hover:underline whitespace-nowrap">忘记密码</a>
          </div>
          <div className="mt-4 flex justify-between" style={{ display: 'none' }}>
            <a 
              href="https://api.efortunetell.blog/api/auth/google" 
              className="inline-block bg-[#FF6F61] hover:bg-[#ff8a75] text-white py-2 px-4 rounded"
            >
              使用Google登录
            </a>
            <a 
              href="https://api.efortunetell.blog/api/auth/github" 
              className="inline-block bg-[#FF6F61] hover:bg-[#ff8a75] text-white py-2 px-4 rounded"
            >
              使用GitHub登录
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}