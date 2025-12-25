'use client';
import { RiPokerHeartsLine, RiPokerClubsLine, RiPokerDiamondsLine, RiPokerSpadesLine } from 'react-icons/ri';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FortunePage() {
  const { t } = useLanguage();
  const router = useRouter();
  
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
      buttonText: t('fortune.getInTouch'),
      serviceType: 'bazi'
    },
    {
      id: 2,
      name: t('service.qimen'),
      description: t('service.qimen.description'),
      price: '$186',
      icon: <RiPokerClubsLine className="text-primary text-2xl" />,
      buttonText: t('fortune.getInTouch'),
      serviceType: 'qimen'
    },
    {
      id: 3,
      name: t('service.liuren'),
      description: t('service.liuren.description'),
      price: '$168',
      icon: <RiPokerDiamondsLine className="text-primary text-2xl" />,
      buttonText: t('fortune.getInTouch'),
      serviceType: 'liuren'
    },
    {
      id: 4,
      name: t('service.naming'),
      description: t('service.naming.description'),
      price: '$816',
      icon: <RiPokerSpadesLine className="text-primary text-2xl" />,
      buttonText: t('fortune.getInTouch'),
      serviceType: 'naming'
    }
  ];

  const handleGetInTouch = async (service: { serviceType: string; name: string; price: string }) => {
    // Payment removed. Direct users to contact page (LINE is shown there).
    router.push(`/contact?service=${encodeURIComponent(service.serviceType)}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#FFFACD]">
      <h1 className="text-xl md:text-2xl font-bold text-[#FF6F61] mb-4 md:mb-6 text-center">
        {t('fortune.title')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
        {services.map((service) => (
          <div 
            key={service.id}
            className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-4 md:p-6 hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="p-2 bg-secondary rounded-full flex-shrink-0">
                {service.icon}
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-card-foreground">
                {service.name}
              </h2>
            </div>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <span className="text-primary font-medium text-lg md:text-xl">
                {service.price}
              </span>
              <Button
                onClick={() => handleGetInTouch(service)}
                disabled={false}
                className="bg-[#FF6F61] hover:bg-[#FF5A4D] text-white w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 text-sm md:text-base"
              >
                {service.buttonText}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}