import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseBrowserClient() {
  type CachedSupabaseClient = SupabaseClient<any, any, any, any, any>;
  const g = globalThis as typeof globalThis & {
    __efortunetell_supabase__?: CachedSupabaseClient;
  };
  if (g.__efortunetell_supabase__) return g.__efortunetell_supabase__;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    'https://qenvxxjwwwpjefeoztak.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_RFuXRucxmplSkTFi0IykiQ_VYYaaW_-';

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const client = createClient(url, anonKey) as CachedSupabaseClient;
  g.__efortunetell_supabase__ = client;
  return client;
}


