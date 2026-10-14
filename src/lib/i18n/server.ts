import { headers } from 'next/headers';
import { detectLanguageFromHeaders, type Language } from './detect';
import { translations } from './translations';

/** Pass the URL locale when available so the server HTML matches the page language (and the page can stay static). */
export async function getServerT(locale?: Language) {
  let language: Language;
  if (locale) {
    language = locale;
  } else {
    const head = await headers();
    const country = head.get('x-vercel-ip-country');
    const acceptLanguage = head.get('accept-language');
    ({ language } = detectLanguageFromHeaders({ country, acceptLanguage }));
  }
  
  const dict = (translations as any)[language] || (translations as any).en;
  const enDict = (translations as any).en;

  const t = (key: string) => dict[key] ?? enDict[key] ?? key;

  return { language, t };
}
