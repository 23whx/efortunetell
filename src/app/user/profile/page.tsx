'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';

type BookingRow = {
  id: string;
  service_type: string;
  email: string;
  birth_datetime: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export default function UserProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState<string>('');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

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

      const { data: rows, error } = await supabase
        .from('bookings')
        .select('id,service_type,email,birth_datetime,notes,status,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setBookings((rows || []) as BookingRow[]);
    }
      setLoading(false);
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-[#FF6F61] p-6 mb-8">
          <div className="flex items-center gap-4 justify-between flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-[#FF6F61] mb-1">{t('user.profile.title')}</h1>
              <p className="text-gray-600">{t('common.email')}: {email}</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => router.push('/user/update-password')}
              >
                {t('user.profile.changePassword')}
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

        <div className="bg-white rounded-lg shadow-md border border-[#FF6F61] p-6">
          <h2 className="text-xl font-bold text-[#FF6F61] mb-4">{t('user.profile.mySubmissions')}</h2>

              {loading ? (
            <div className="text-gray-500">{t('common.loading')}</div>
          ) : bookings.length === 0 ? (
            <div className="text-gray-500">{t('user.profile.noBookings')}</div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between flex-wrap gap-2">
                    <div className="font-semibold text-gray-800">
                      {t(`service.${b.service_type}`) !== `service.${b.service_type}` 
                        ? t(`service.${b.service_type}`) 
                        : b.service_type}
                    </div>
                    <div className="text-sm text-gray-500">{new Date(b.created_at).toLocaleString(t('common.locale') || 'en-US')}</div>
                </div>
                  <div className="text-sm text-gray-700 mt-2">
                    <div>{t('common.email')}: {b.email}</div>
                    {b.birth_datetime && <div>{t('user.profile.birthTime')}: {b.birth_datetime}</div>}
                    {b.notes && <div className="mt-1">{t('user.profile.notes')}: {b.notes}</div>}
                    <div className="mt-1">{t('common.status')}: {t(`booking.status.${b.status}`) || b.status}</div>
            </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
