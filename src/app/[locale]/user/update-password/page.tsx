'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UpdatePasswordPage() {
  const { t } = useLanguage();
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
      setError(t('user.updatePassword.minLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('user.updatePassword.mismatch'));
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(t('user.updatePassword.success'));
      setTimeout(() => router.push('/user/profile'), 800);
    } catch (err) {
      console.error('更新密码失败:', err);
      setError(err instanceof Error ? err.message : t('user.updatePassword.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">{t('user.updatePassword.title')}</h1>

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
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="password">{t('user.updatePassword.newPassword')}</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder={t('user.updatePassword.newPasswordPlaceholder')}
            />
          </div>
          <div className="mb-6 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="confirm-password">{t('user.register.confirmPassword')}</label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder={t('user.updatePassword.confirmPasswordPlaceholder')}
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="submit"
              className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none px-8"
              disabled={isLoading}
            >
              {isLoading ? t('user.updatePassword.submitting') : t('user.updatePassword.submit')}
            </Button>
            <Button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none"
              onClick={() => router.push('/user/profile')}
            >
              {t('common.back')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
