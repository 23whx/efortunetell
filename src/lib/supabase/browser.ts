import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    'https://qenvxxjwwwpjefeoztak.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_RFuXRucxmplSkTFi0IykiQ_VYYaaW_-';

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const parseCookie = (cookieStr: string): Record<string, string> => {
    // Robust cookie parsing for browser; ignore invalid segments.
    const out: Record<string, string> = {};
    cookieStr.split(';').forEach((part) => {
      const p = part.trim();
      if (!p) return;
      const eq = p.indexOf('=');
      if (eq === -1) return;
      const name = p.slice(0, eq).trim();
      const value = p.slice(eq + 1);
      if (!name) return;
      out[name] = value;
    });
    return out;
  };

  const cookieOptionsToString = (
    options?: {
      domain?: string;
      expires?: Date | string;
      httpOnly?: boolean; // ignored in browser
      maxAge?: number;
      path?: string;
      sameSite?: 'lax' | 'strict' | 'none';
      secure?: boolean;
    },
  ) => {
    if (!options) return 'Path=/';
    const parts: string[] = [];
    parts.push(`Path=${options.path ?? '/'}`);
    if (options.domain) parts.push(`Domain=${options.domain}`);
    if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
    if (options.expires) {
      const exp =
        typeof options.expires === 'string' ? new Date(options.expires) : options.expires;
      if (!Number.isNaN(exp.getTime())) parts.push(`Expires=${exp.toUTCString()}`);
    }
    if (options.sameSite) parts.push(`SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`);
    if (options.secure) parts.push('Secure');
    // httpOnly cannot be set via document.cookie; ignore.
    return parts.join('; ');
  };

  // Important: use @supabase/ssr browser client so OAuth sessions set via cookies
  // (e.g. in /auth/callback) are visible to client components.
  return createBrowserClient(url, anonKey, {
    isSingleton: true,
    cookies: {
      // @supabase/ssr >= 0.7 requires getAll/setAll (or get/set/remove)
      getAll() {
        if (typeof document === 'undefined') return [];
        const parsed = parseCookie(document.cookie ?? '');
        return Object.entries(parsed).map(([name, value]) => ({ name, value }));
      },
      setAll(cookies) {
        if (typeof document === 'undefined') return;
        cookies.forEach(({ name, value, options }) => {
          const optStr = cookieOptionsToString(options);
          document.cookie = `${name}=${value}; ${optStr}`;
        });
      },
    }
  });
}


