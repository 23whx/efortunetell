'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { API_ROUTES } from '@/config/api';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: 填写邮箱 2: 填写验证码和新密码
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // 发送验证码
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess('');
    try {
      const response = await fetch(API_ROUTES.SEND_RESET_CODE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
        setSuccess('验证码已发送到邮箱，请在60秒内输入。');
        setCountdown(60);
        timerRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || '发送验证码失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 校验验证码并重置密码
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少为6个字符');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(API_ROUTES.VERIFY_RESET_CODE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, code, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('修改密码成功！1秒后跳转登录页');
        setTimeout(() => {
          router.push('/user/login');
        }, 1000);
      } else {
        setError(data.message || '验证码或密码错误');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">找回密码</h1>
        {error && (
          <div className="mb-4 p-2 bg-[#FF6F61]/10 text-[#FF6F61] text-sm rounded border border-[#FF6F61]">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded border border-green-300">{success}</div>
        )}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div className="mb-4 flex items-center gap-2">
              <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="username">用户名</label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
                placeholder="请输入您的用户名"
              />
            </div>
            <div className="mb-6 flex items-center gap-2">
              <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="email">邮箱</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
                placeholder="请输入您的注册邮箱"
              />
            </div>
            <div className="flex justify-between items-center">
              <Button type="submit" className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none px-8" disabled={isLoading}>
                {isLoading ? '发送中...' : '下一步'}
              </Button>
              <Button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none" onClick={() => router.push('/user/login')}>
                返回登录
              </Button>
            </div>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyAndReset}>
            <div className="mb-4 flex items-center gap-2">
              <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="code">验证码</label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
                placeholder="请输入邮箱验证码"
              />
              <span className="text-xs text-gray-500 w-24 text-left">{countdown > 0 ? `${countdown}s后失效` : '请重新获取'}</span>
            </div>
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
              <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="confirmPassword">确认密码</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
                placeholder="请再次输入新密码"
              />
            </div>
            <div className="flex justify-between items-center">
              <Button type="submit" className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none px-8" disabled={isLoading || countdown === 0}>
                {isLoading ? '提交中...' : '重置密码'}
              </Button>
              <Button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none" onClick={() => router.push('/user/login')}>
                返回登录
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 