/** Canonical public origin. Every canonical / sitemap / OG / JSON-LD URL derives from this. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fortunetell.oumashu.top').replace(/\/$/, '');

export const SITE_NAME = 'Rollkey Divination Blog';
export const SITE_NAME_ZH = '滚键Rollkey命理博客';

/** Public contact / consultation inbox (payments are closed; consultations are arranged by email). */
export const CONTACT_EMAIL = 'wyh93829@gmail.com';

export const ADSENSE_CLIENT = 'ca-pub-4880646654838411';
export const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/** 1200×630 share images in /public/og */
export const OG_IMAGES = {
  default: '/og/default.jpg',
  tools: '/og/tools.jpg',
  bazi: '/og/bazi.jpg',
  qimen: '/og/qimen.jpg',
  daliuren: '/og/daliuren.jpg',
  almanac: '/og/almanac.jpg',
  naming: '/og/naming.jpg',
} as const;

export type OgImageKey = keyof typeof OG_IMAGES;

/** Stable @id anchors so every page's JSON-LD links into one entity graph */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const AUTHOR_ID = `${SITE_URL}/#rollkey`;

/** Serialize JSON-LD safely for inline <script> (prevents `</script>` breakout). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
