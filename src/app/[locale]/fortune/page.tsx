'use client';
import { RiPokerHeartsLine, RiPokerClubsLine, RiPokerDiamondsLine, RiPokerSpadesLine } from 'react-icons/ri';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CONTACT_EMAIL } from '@/lib/site';

export default function FortunePage() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // No-op: legacy localStorage auth removed (Supabase session is used elsewhere)
  }, []);

  const services = [
    {
      id: 1,
      name: t('service.bazi'),
      description: t('service.bazi.description'),
      price: '$618',
      icon: <RiPokerHeartsLine className="text-primary text-2xl" />,
      buttonText: t('fortune.emailConsult'),
      serviceType: 'bazi'
    },
    {
      id: 2,
      name: t('service.qimen'),
      description: t('service.qimen.description'),
      price: '$186',
      icon: <RiPokerClubsLine className="text-primary text-2xl" />,
      buttonText: t('fortune.emailConsult'),
      serviceType: 'qimen'
    },
    {
      id: 3,
      name: t('service.liuren'),
      description: t('service.liuren.description'),
      price: '$168',
      icon: <RiPokerDiamondsLine className="text-primary text-2xl" />,
      buttonText: t('fortune.emailConsult'),
      serviceType: 'liuren'
    },
    {
      id: 4,
      name: t('service.naming'),
      description: t('service.naming.description'),
      price: '$816',
      icon: <RiPokerSpadesLine className="text-primary text-2xl" />,
      buttonText: t('fortune.emailConsult'),
      serviceType: 'naming'
    }
  ];

  // 支付通道暂时关闭：所有服务改为邮件咨询
  const mailto = (service: { name: string; price: string }) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${service.name} — ${service.price}`)}`;

  return (
    <div className="min-h-screen px-4 py-12 md:py-20 bg-[#faf9f6]">
      <div className="text-center mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          {t('fortune.title')}
        </h1>
        <div className="w-12 h-[3px] bg-[#FF6F61] mx-auto mt-5 rounded-full" />
        <p className="mt-5 text-sm text-gray-500">
          {t('fortune.emailNote')}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#FF6F61] font-medium hover:underline">{CONTACT_EMAIL}</a>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {services.map((service) => (
          <div 
            key={service.id}
            className="bg-white border border-[#f0ece3] rounded-2xl p-6 md:p-8 hover:border-[#FF6F61]/30 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="p-2 bg-[#FF6F61]/8 rounded-full flex-shrink-0">
                {service.icon}
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {service.name}
              </h2>
            </div>
            <p className="text-gray-500 mb-5 text-sm md:text-base leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-[#f0ece3]">
              <span className="text-[#FF6F61] font-semibold text-lg md:text-xl font-display">
                {service.price}
              </span>
              <a
                href={mailto(service)}
                className="inline-flex items-center justify-center rounded-md font-medium bg-[#FF6F61] hover:bg-[#FF5A4D] text-white w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 text-sm md:text-base transition-colors"
              >
                {service.buttonText}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
