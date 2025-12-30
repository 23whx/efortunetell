'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { ensureMyProfile, getMyProfile } from '@/lib/supabase/profile';

export default function UserLoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Make sure profile exists (fresh project)
      await ensureMyProfile(supabase);

      // If admin, send to admin dashboard; otherwise profile
      const { role } = await getMyProfile(supabase);
      router.push(role === 'admin' ? '/admin/dashboard' : '/user/profile');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : t('error.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=/`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('OAuth login error:', err);
      setError(err instanceof Error ? err.message : t('error.networkError'));
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
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="email">{t('common.email')}</label>
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
          <div className="mb-6 flex items-center gap-2">
            <label className="block font-medium text-[#FF6F61] w-20 text-right" htmlFor="password">{t('user.login.password')}</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#FF6F61] focus:ring-[#FF6F61] focus:border-[#FF6F61] flex-1"
              placeholder={t('user.login.passwordHint')}
            />
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <Button 
              type="submit" 
              className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white border-none px-8"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('user.login.submit')}
            </Button>
            <a href="/user/forgot-password" className="text-[#FF6F61] text-sm hover:underline whitespace-nowrap">{t('user.login.forgotPassword')}</a>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              className="bg-gray-900 hover:bg-black text-white border-none"
              disabled={isLoading}
              onClick={() => handleOAuth('google')}
            >
              Google
            </Button>
            <Button
              type="button"
              className="bg-gray-900 hover:bg-black text-white border-none"
              disabled={isLoading}
              onClick={() => handleOAuth('github')}
            >
              GitHub
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
