'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Send reset email (Supabase)
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess('');
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/user/update-password`,
      });
      if (error) throw error;
      setSuccess(t('user.forgotPassword.success'));
    } catch {
      setError(t('blog.networkError') || '网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-50px] bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#FF6F61]">{t('user.forgotPassword.title')}</h1>
        {error && (
          <div className="mb-4 p-2 bg-[#FF6F61]/10 text-[#FF6F61] text-sm rounded border border-[#FF6F61]">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded border border-green-300">{success}</div>
        )}
        <form onSubmit={handleSendResetEmail}>
            <div className="mb-6 flex items-center gap-2">
              <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="email">{t('common.email')}</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
                placeholder={t('user.forgotPassword.emailPlaceholder')}
              />
            </div>
            <div className="flex justify-between items-center">
              <Button type="submit" className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none px-8" disabled={isLoading}>
              {isLoading ? t('user.forgotPassword.sending') : t('user.forgotPassword.sendButton')}
              </Button>
              <Button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none" onClick={() => router.push('/user/login')}>
                {t('common.back')}
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
} 
