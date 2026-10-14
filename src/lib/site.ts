/** Canonical public origin. Every canonical / sitemap / OG / JSON-LD URL derives from this. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fortunetell.oumashu.top').replace(/\/$/, '');

export const SITE_NAME = '旭通命理小站';
/** Same brand in every language (kept as a separate export for call sites that distinguish zh) */
export const SITE_NAME_ZH = SITE_NAME;

/** Site author. Simplified form on the (Simplified-Chinese) site; Traditional form listed as an alternate name. */
export const AUTHOR_NAME = '卧烟居士';
export const AUTHOR_NAME_ALT = '臥煙居士';

/** Former names of the admin account; articles by these profiles are shown as AUTHOR_NAME */
const LEGACY_AUTHOR_NAMES = new Set(['Rollkey', '旭通', '滚键Rollkey', '滚键', '关键Rollkey', AUTHOR_NAME_ALT]);

export function displayAuthor(name: string | null | undefined): string {
  return !name || LEGACY_AUTHOR_NAMES.has(name) ? AUTHOR_NAME : name;
}

/** For names that are always present (e.g. comment authors): only rename the legacy admin names */
export function renameLegacyAuthor(name: string): string {
  return LEGACY_AUTHOR_NAMES.has(name) ? AUTHOR_NAME : name;
}

export function isSiteAuthor(name: string | null | undefined): boolean {
  return displayAuthor(name) === AUTHOR_NAME;
}

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
