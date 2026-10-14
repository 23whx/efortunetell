import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, localeHtmlLang, locales, type Locale } from '@/lib/i18n/config';
import { SITE_COPY } from '@/lib/i18n/seo';
import { LocaleSync } from '@/components/i18n/LocaleSync';
import SiteFrame from '../site-frame';
import {
  AUTHOR_ID,
  OG_IMAGES,
  ORG_ID,
  SITE_NAME,
  SITE_NAME_ZH,
  SITE_URL,
  WEBSITE_ID,
  jsonLd,
} from '@/lib/site';

export { viewport } from '../site-frame';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const copy = SITE_COPY[isLocale(raw) ? raw : 'en'];
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: copy.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: copy.description,
    applicationName: SITE_NAME,
    authors: [{ name: 'Rollkey', url: 'https://x.com/Rollkey4' }],
    creator: 'Rollkey',
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icon.png' }],
      shortcut: ['/favicon.ico'],
    },
    alternates: {
      types: { 'application/rss+xml': `${SITE_URL}/rss.xml` },
    },
    openGraph: {
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: OG_IMAGES.default, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Rollkey4',
      creator: '@Rollkey4',
      images: [OG_IMAGES.default],
    },
  };
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

  const siteGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: [SITE_NAME_ZH, '滚键命理', 'Rollkey'],
        description: SITE_COPY.en.description,
        inLanguage: locales.map((l) => localeHtmlLang[l]),
        publisher: { '@id': ORG_ID },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: SITE_NAME,
        alternateName: SITE_NAME_ZH,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png`, width: 690, height: 690 },
        sameAs: ['https://x.com/Rollkey4'],
        founder: { '@id': AUTHOR_ID },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'wanghongxiang23@gmail.com',
          availableLanguage: ['zh', 'en'],
        },
      },
      {
        '@type': 'Person',
        '@id': AUTHOR_ID,
        name: 'Rollkey',
        alternateName: '滚键',
        url: SITE_URL,
        image: `${SITE_URL}/admin_img.jpg`,
        sameAs: ['https://x.com/Rollkey4'],
        knowsAbout: ['BaZi', 'Four Pillars of Destiny', 'Qimen Dunjia', 'Da Liu Ren', 'Feng Shui', 'Chinese almanac', 'Chinese name selection'],
      },
    ],
  };

  return (
    <SiteFrame
      lang={localeHtmlLang[locale]}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      locale={locale}
      head={
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(siteGraph) }}
        />
      }
    >
      <LocaleSync locale={locale} htmlLang={localeHtmlLang[locale]} />
      {children}
    </SiteFrame>
  );
}
