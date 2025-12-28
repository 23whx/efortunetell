export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'ar';

const AR_COUNTRIES = new Set([
  'AE', 'SA', 'EG', 'IQ', 'JO', 'KW', 'QA', 'BH', 'OM', 'YE', 'SY', 'LB', 'PS',
  'DZ', 'MA', 'TN', 'LY', 'SD', 'MR',
]);

const ZH_COUNTRIES = new Set(['CN', 'HK', 'MO', 'TW']);

export function detectLanguageFromHeaders(input: {
  country?: string | null;
  acceptLanguage?: string | null;
}): { language: Language; reason: string } {
  const country = (input.country || '').toUpperCase().trim();

  if (country === 'JP') return { language: 'ja', reason: 'country=JP' };
  if (country === 'KR') return { language: 'ko', reason: 'country=KR' };
  if (AR_COUNTRIES.has(country)) return { language: 'ar', reason: `country=${country}` };
  if (ZH_COUNTRIES.has(country)) return { language: 'zh', reason: `country=${country}` };

  const al = (input.acceptLanguage || '').toLowerCase();
  // very small parser: match order
  if (al.includes('zh')) return { language: 'zh', reason: 'accept-language' };
  if (al.includes('ja')) return { language: 'ja', reason: 'accept-language' };
  if (al.includes('ko')) return { language: 'ko', reason: 'accept-language' };
  if (al.includes('ar')) return { language: 'ar', reason: 'accept-language' };

  return { language: 'en', reason: 'default' };
}


