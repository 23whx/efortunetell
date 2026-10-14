'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocalePath } from '@/hooks/useLocalePath';
import { CONTACT_EMAIL } from '@/lib/site';

// 支付通道暂时关闭（原模拟支付页会在浏览器里直接把订单改为已支付）。
export default function PaymentClosedPage() {
  const { t } = useLanguage();
  const lp = useLocalePath();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-4">
      <div className="bg-white rounded-3xl border border-[#f0ece3] p-10 max-w-md text-center">
        <Mail className="w-12 h-12 text-[#FF6F61] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('payment.closedTitle')}</h1>
        <p className="text-gray-600 mb-6">{t('payment.closedMessage')}</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-block bg-[#FF6F61] hover:bg-[#FF5A4D] text-white rounded-xl px-6 py-3 font-medium"
        >
          {CONTACT_EMAIL}
        </a>
        <div className="mt-6">
          <Link href={lp('/fortune')} className="text-sm text-gray-500 hover:text-[#FF6F61]">
            {t('fortune.booking.backToList')}
          </Link>
        </div>
      </div>
    </div>
  );
}
