'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { ensureMyProfile } from '@/lib/supabase/profile';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError('密码最少需要6个字符');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 验证密码
    const isPasswordValid = validatePassword(password);
    
    if (!isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/user/profile`,
        },
      });
      if (signUpError) throw signUpError;

      // If email confirmations are disabled, ensure profile immediately and go profile.
      try {
        await ensureMyProfile(supabase);
        router.push('/user/profile');
      } catch {
        // Email confirmation mode: user will confirm via email.
        router.push('/user/login');
      }
    } catch (err) {
      console.error('注册错误:', err);
      setError(err instanceof Error ? err.message : t('error.networkError'));
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
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="email"><span className="text-red-500">*</span>Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder="name@example.com"
            />
          </div>
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
          <Button 
            type="submit" 
            className="w-full bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') + '...' : t('user.register.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
} 