import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    'https://qenvxxjwwwpjefeoztak.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_RFuXRucxmplSkTFi0IykiQ_VYYaaW_-';

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // In Server Components, setting cookies can fail; middleware should handle refresh.
        }
      },
    },
  });
}


