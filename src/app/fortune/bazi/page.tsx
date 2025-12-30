'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BaziBookingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [birthDateTime, setBirthDateTime] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!birthDateTime) {
      setError(t('fortune.booking.errorBirthTime'));
      return;
    }
    if (!email) {
      setError(t('fortune.booking.errorEmail'));
      return;
    }
    
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from('bookings').insert({
        user_id: auth.user?.id ?? null,
        service_type: 'bazi',
        email,
        birth_datetime: birthDateTime,
        notes: notes || null,
        status: 'contact_requested',
      });
      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      console.error('Submit booking error:', err);
      setError(err instanceof Error ? err.message : t('error.serverError'));
    } finally {
      setIsLoading(false);
    }
  };
      
      if (success) {
  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8 text-center">
          <h1 className="text-2xl font-bold text-[#FF6F61] mb-4">{t('fortune.booking.successTitle')}</h1>
          <p className="text-gray-700 mb-6">
            {t('fortune.booking.successMessage')}<span className="font-semibold select-all">whx953829</span>
          </p>
          <div className="flex justify-center gap-3">
            <Button className="bg-[#FF6F61] text-white" onClick={() => router.push('/contact')}>
              {t('fortune.booking.contactPage')}
            </Button>
            <Button className="bg-gray-200 text-gray-800" onClick={() => router.push('/fortune')}>
              {t('fortune.booking.backToList')}
            </Button>
          </div>
        </div>
              </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8">
        <h1 className="text-2xl font-bold text-[#FF6F61] mb-6 text-center">
          {t('service.bazi')} {t('fortune.booking.title')} ({t('fortune.booking.free')})
        </h1>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
            {t('fortune.booking.birthTime')} <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={birthDateTime}
              onChange={(e) => setBirthDateTime(e.target.value)}
              className="border border-[#FF6F61] rounded w-full py-2 px-3"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <Mail className="mr-2 text-[#FF6F61]" size={16} />
            {t('common.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
              className="border border-[#FF6F61] rounded w-full py-2 px-3"
              required
            />
          <p className="text-xs text-gray-500 mt-1">{t('fortune.booking.emailHint')}</p>
      </div>
      
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">{t('fortune.booking.notes')} ({t('common.optional')})</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border border-[#FF6F61] rounded w-full py-2 px-3"
            rows={4}
            placeholder={t('fortune.booking.notesPlaceholder')}
          />
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
        <div className="flex justify-center">
          <Button className="bg-[#FF6F61] text-white px-6 py-2" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t('fortune.booking.submitting') : t('fortune.booking.submit')}
              </Button>
            </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          {t('fortune.booking.afterSubmitHint')}
        </div>
      </div>
    </div>
  );
} 
