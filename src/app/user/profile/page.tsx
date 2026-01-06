'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace('/user/login');
        return;
      }

      setEmail(user.email || '');
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-[#FF6F61] p-6">
          <div className="flex items-center gap-4 justify-between flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-[#FF6F61] mb-1">{t('user.profile.title')}</h1>
              <p className="text-gray-600">{t('common.email')}: {email}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => router.push('/user/update-password')}
              >
                {t('user.profile.changePassword')}
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => router.push('/user/my-comments')}
              >
                {t('user.profile.myComments')}
              </Button>
              <Button
                className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white"
                onClick={() => router.push('/fortune')}
              >
                {t('user.profile.goToSubmit')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
