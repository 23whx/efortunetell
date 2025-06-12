'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { API_ROUTES } from '@/config/api';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userData, setUserData] = useState<{ username: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已经通过验证
    const verifiedData = localStorage.getItem('passwordResetVerified');
    
    if (!verifiedData) {
      router.push('/user/forgot-password');
      return;
    }
    
    try {
      const parsed = JSON.parse(verifiedData);
      const timestamp = parsed.timestamp || 0;
      const currentTime = Date.now();
      
      // 验证有效期为10分钟
      if (currentTime - timestamp > 10 * 60 * 1000) {
        // 验证已过期
        localStorage.removeItem('passwordResetVerified');
        router.push('/user/forgot-password');
        return;
      }
      
      // 验证有效
      setIsVerified(true);
      setUserData({
        username: parsed.username,
        email: parsed.email
      });
    } catch (err) {
      // 解析失败，重定向到找回密码页面
      router.push('/user/forgot-password');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 基本验证
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (password.length < 6) {
      setError('密码长度至少为6个字符');
      return;
    }
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // 确保userData存在
      if (!userData) {
        throw new Error('用户验证信息丢失');
      }
      
      const response = await fetch(`${API_ROUTES.RESET_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('密码重置成功！将在3秒后跳转到登录页面...');
        // 清除验证状态
        localStorage.removeItem('passwordResetVerified');
        
        // 短暂延迟后跳转到登录页面
        setTimeout(() => {
          router.push('/user/login');
        }, 3000);
      } else {
        setError(data.message || '密码重置失败，请重试');
      }
    } catch (err) {
      console.error('重置密码错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61] text-center">
          <h1 className="text-2xl font-bold mb-4 text-[#FF6F61]">验证中...</h1>
          <div className="w-10 h-10 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">重置密码</h1>
        
        {error && (
          <div className="mb-4 p-2 bg-[#FF6F61]/10 text-[#FF6F61] text-sm rounded border border-[#FF6F61]">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded border border-green-300">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="password">新密码</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="请输入新密码"
            />
          </div>
          <div className="mb-6 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="confirm-password">确认密码</label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="请再次输入新密码"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              type="submit" 
              className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none px-8"
              disabled={isLoading}
            >
              {isLoading ? '提交中...' : '重置密码'}
            </Button>
            <Button 
              type="button" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none"
              onClick={() => router.push('/user/login')}
            >
              返回登录
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 