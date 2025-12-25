import { NextResponse } from 'next/server';

export function middleware() {
  // Supabase SSR session refresh middleware removed to avoid Edge Runtime incompat warnings.
  // This app relies on client-side auth + server component checks (e.g. /admin/layout) for now.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - static files
     * - image optimization files
     * - favicon
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};


