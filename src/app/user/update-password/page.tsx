'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('密码长度至少为6个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess('密码已更新，正在跳转...');
      setTimeout(() => router.push('/user/profile'), 800);
    } catch (err) {
      console.error('更新密码失败:', err);
      setError(err instanceof Error ? err.message : '更新失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">更改密码</h1>

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
              {isLoading ? '提交中...' : '更新密码'}
            </Button>
            <Button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none"
              onClick={() => router.push('/user/profile')}
            >
              返回
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


