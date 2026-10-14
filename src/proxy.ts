import { NextRequest, NextResponse } from 'next/server';
import {
  defaultLocale,
  isLocale,
  LOCALE_EXCLUDED_PREFIXES,
  pathHasLocale,
} from '@/lib/i18n/config';
import { detectLanguageFromHeaders } from '@/lib/i18n/detect';

function isExcluded(pathname: string): boolean {
  if (
    pathname.includes('.') &&
    !pathname.endsWith('.xml') &&
    !pathname.endsWith('.txt')
  ) {
    // static assets like .png .js .css under public/
    const last = pathname.split('/').pop() || '';
    if (/\.(png|jpg|jpeg|gif|svg|ico|webp|js|css|map|woff2?|ttf|json)$/i.test(last)) {
      return true;
    }
  }
  return LOCALE_EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isExcluded(pathname)) {
    return NextResponse.next();
  }

  if (pathHasLocale(pathname)) {
    return NextResponse.next();
  }

  // Prefer cookie if user already chose language on SEO routes
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  let locale = defaultLocale;
  if (cookieLocale && isLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const detected = detectLanguageFromHeaders({
      country:
        request.headers.get('x-vercel-ip-country') ||
        request.headers.get('cf-ipcountry'),
      acceptLanguage: request.headers.get('accept-language'),
    });
    // Site default is English for SEO root; only use detection when cookie missing
    // and Accept-Language is strongly non-English — still default en per product decision.
    locale = defaultLocale;
    void detected;
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except Next internals that never need locale.
     * Further filtering happens in isExcluded().
     */
    '/((?!_next/static|_next/image|.*\\..*).*)',
  ],
};
