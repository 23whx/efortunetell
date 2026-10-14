import { localeHtmlLang, type Locale } from '@/lib/i18n/config';
import { absoluteUrl } from '@/lib/i18n/seo';
import { OG_IMAGES, ORG_ID, SITE_URL, WEBSITE_ID, jsonLd, type OgImageKey } from '@/lib/site';

const TOOLS_LABEL: Record<Locale, string> = {
  en: 'Tools',
  zh: '工具',
  ja: 'ツール',
  ko: '도구',
  ar: 'الأدوات',
};

/** Server-rendered WebApplication + BreadcrumbList structured data for a free online tool page. */
export default function ToolJsonLd({
  locale,
  path,
  name,
  description,
  image,
}: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  image: OgImageKey;
}) {
  const url = absoluteUrl(locale, path);
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name,
        description,
        url,
        image: `${SITE_URL}${OG_IMAGES[image]}`,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        inLanguage: localeHtmlLang[locale],
        isPartOf: { '@id': WEBSITE_ID },
        provider: { '@id': ORG_ID },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Rollkey', item: absoluteUrl(locale, '/') },
          { '@type': 'ListItem', position: 2, name: TOOLS_LABEL[locale], item: absoluteUrl(locale, '/tools') },
          { '@type': 'ListItem', position: 3, name, item: url },
        ],
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
