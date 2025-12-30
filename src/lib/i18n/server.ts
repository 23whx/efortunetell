import { headers } from 'next/headers';
import { detectLanguageFromHeaders } from './detect';
import { translations } from './translations';

export async function getServerT() {
  const head = await headers();
  const country = head.get('x-vercel-ip-country');
  const acceptLanguage = head.get('accept-language');
  
  const { language } = detectLanguageFromHeaders({ country, acceptLanguage });
  
  const dict = (translations as any)[language] || (translations as any).en;
  const enDict = (translations as any).en;

  const t = (key: string) => dict[key] ?? enDict[key] ?? key;

  return { language, t };
}
