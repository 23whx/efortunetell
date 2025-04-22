'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

export default function UserLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const tempUsers = [
    { username: 'yonghu1', password: '123456' },
    { username: 'yonghu2', password: '123456' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 前端模拟校验
    const found = tempUsers.find(u => u.username === username && u.password === password);
    if (found) {
      localStorage.setItem('user', JSON.stringify({ username: found.username }));
      router.push('/user/profile');
      return;
    }
    setError('账号或密码错误');
    // 如需保留后端API校验，可将下方代码注释去掉
    /*
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.message || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
    */
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">用户登录</h1>
        
        {error && (
          <div className="mb-4 p-2 bg-[#FF6F61]/10 text-[#FF6F61] text-sm rounded border border-[#FF6F61]">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="username">用户名</label>
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
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="password">密码</label>
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
          <div className="flex items-center mb-4 gap-4">
            <Button type="submit" className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none px-8">
              登录
            </Button>
            <a href="/user/forgot-password" className="text-[#FF6F61] text-sm hover:underline whitespace-nowrap">忘记密码</a>
          </div>
          <div className="flex gap-2">
            <Button type="button" className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#FF6F61] text-black hover:bg-[#FFFACD]">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_17_40)"><path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.12h13.008c-.56 2.96-2.24 5.456-4.768 7.136v5.888h7.712c4.52-4.16 7.1-10.288 7.1-17.44z" fill="#4285F4"/><path d="M24.48 48c6.48 0 11.92-2.144 15.888-5.824l-7.712-5.888c-2.144 1.44-4.88 2.288-8.176 2.288-6.288 0-11.616-4.256-13.528-9.968H2.56v6.176C6.512 43.36 14.624 48 24.48 48z" fill="#34A853"/><path d="M10.952 28.608A14.88 14.88 0 0 1 9.6 24c0-1.6.28-3.152.784-4.608V13.216H2.56A23.98 23.98 0 0 0 0 24c0 3.872.92 7.52 2.56 10.784l8.392-6.176z" fill="#FBBC05"/><path d="M24.48 9.6c3.528 0 6.656 1.216 9.136 3.584l6.848-6.848C36.392 2.144 30.96 0 24.48 0 14.624 0 6.512 4.64 2.56 13.216l8.392 6.176c1.912-5.712 7.24-9.792 13.528-9.792z" fill="#EA4335"/></g><defs><clipPath id="clip0_17_40"><path fill="#fff" d="M0 0h48v48H0z"/></clipPath></defs></svg>
              <span className="text-black">使用 Google 登录</span>
            </Button>
            <Button type="button" className="flex-1 flex items-center justify-center gap-2 bg-black text-white border border-black hover:bg-gray-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562V12h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/></svg>
              使用 GitHub 登录
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}