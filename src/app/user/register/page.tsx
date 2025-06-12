'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { API_ROUTES } from '@/config/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      setUsernameError('用户名最少需要3个字符');
      return false;
    } else if (value.length > 20) {
      setUsernameError('用户名最多允许20个字符');
      return false;
    } else {
      setUsernameError('');
      return true;
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError('密码最少需要6个字符');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 验证用户名和密码
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    
    if (!isUsernameValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    // 输出状态值以调试
    console.log('用户名:', username);
    console.log('密码:', password);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);

    // 输出FormData内容以调试
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch(API_ROUTES.REGISTER, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push('/user/profile');
      } else {
        setError(data.message || t('user.register.error'));
      }
    } catch (err) {
      console.error('注册错误:', err);
      setError(t('error.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">{t('user.register.title')}</h1>
        {error && (
          <div className="mb-4 p-2 bg-[#FF6F61]/10 text-[#FF6F61] text-sm rounded border border-[#FF6F61]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="username"><span className="text-red-500">*</span>{t('user.register.username')}</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="请输入用户名"
            />
          </div>
          {usernameError && (
            <div className="mb-2 ml-20 text-red-500 text-sm">
              {usernameError}
            </div>
          )}
          <div className="mb-4 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="password"><span className="text-red-500">*</span>{t('user.register.password')}</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="请输入密码"
            />
          </div>
          {passwordError && (
            <div className="mb-2 ml-20 text-red-500 text-sm">
              {passwordError}
            </div>
          )}
          <div className="mb-4 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="email">{t('user.register.email')}</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="请输入邮箱地址"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') + '...' : t('user.register.submit')}
          </Button>
        </form>
        <div className="mt-4 flex justify-between" style={{ display: 'none' }}>
          <a 
            href="http://localhost:5000/api/auth/google" 
            className="inline-block bg-[#FF6F61] hover:bg-[#ff8a75] text-white py-2 px-4 rounded"
          >
            使用Google登录
          </a>
          <a 
            href="http://localhost:5000/api/auth/github" 
            className="inline-block bg-[#FF6F61] hover:bg-[#ff8a75] text-white py-2 px-4 rounded"
          >
            使用GitHub登录
          </a>
        </div>
      </div>
    </div>
  );
} 