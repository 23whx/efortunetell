'use client';

import Link from 'next/link';
import { PILLARS } from '@/lib/seo/pillars';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocalePath } from '@/hooks/useLocalePath';

export default function ServicesIndexPage() {
  const { t, language } = useLanguage();
  const lp = useLocalePath();

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {t('services.title')} <span className="text-[#FF6F61] italic">{t('services.featured')}</span>
          </h1>
          <div className="w-12 h-[3px] bg-[#FF6F61] mx-auto mt-6 rounded-full" />
          <p className="mt-6 text-gray-500 leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((p) => (
            <Link
              key={p.key}
              href={lp(`/services/${p.slug}`)}
              className="group bg-white rounded-2xl border border-[#f0ece3] p-8 hover:border-[#FF6F61]/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400">
                    {p.enTitle}
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-gray-900 group-hover:text-[#FF6F61] transition-colors font-display">
                    {(() => {
                      const translationKey = p.key.replace('daliuren', 'liuren').replace('qimen-yinpan', 'qimen');
                      return t(`services.${translationKey}.title`) !== `services.${translationKey}.title`
                        ? t(`services.${translationKey}.title`)
                        : p.zhTitle;
                    })()}
                  </div>
                </div>
                <span className="text-gray-300 text-xl group-hover:text-[#FF6F61] group-hover:translate-x-0.5 transition-all duration-300">
                  →
                </span>
              </div>

              <p className="mt-5 text-sm text-gray-500 leading-relaxed">
                {(() => {
                  const translationKey = p.key.replace('daliuren', 'liuren').replace('qimen-yinpan', 'qimen');
                  return t(`services.${translationKey}.desc`) !== `services.${translationKey}.desc`
                    ? t(`services.${translationKey}.desc`)
                    : p.zhDesc;
                })()}
              </p>

              <div className="mt-6 pt-5 border-t border-[#f0ece3] flex flex-wrap gap-x-4 gap-y-2">
                {p.keywordKeys.slice(0, 4).map((k) => (
                  <span
                    key={k}
                    className="text-[10px] font-medium uppercase tracking-widest text-gray-400"
                  >
                    {t(k)}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


