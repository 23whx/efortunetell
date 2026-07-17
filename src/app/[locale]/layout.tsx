import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isLocale, localeHtmlLang, locales, type Locale } from '@/lib/i18n/config';
import { LocaleSync } from '@/components/i18n/LocaleSync';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <>
      <LocaleSync locale={locale} htmlLang={localeHtmlLang[locale]} />
      {children}
    </>
  );
}
