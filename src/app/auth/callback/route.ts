import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    'https://qenvxxjwwwpjefeoztak.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_RFuXRucxmplSkTFi0IykiQ_VYYaaW_-';

  if (!url || !anonKey) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  let response = NextResponse.redirect(`${origin}${next}`);

  if (!code) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  // Ensure an app-level profile row exists for OAuth sign-ins.
  // (Supabase Auth user lives in auth.users; our app uses public.profiles)
  if (!error) {
    const session = data.session;
    const user = data.user ?? session?.user;

    if (session?.access_token && user) {
      const displayName =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        (user.email ? user.email.split('@')[0] : null);

      const avatarUrl =
        (user.user_metadata?.avatar_url as string | undefined) ??
        (user.user_metadata?.picture as string | undefined) ??
        null;

      // Use an authed client so RLS sees auth.uid() and allows inserting own profile.
      const authed = createClient(url, anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      });

      await authed.from('profiles').upsert(
        {
          id: user.id,
          role: 'user',
          display_name: displayName,
          avatar_url: avatarUrl,
        },
        { onConflict: 'id' }
      );
    }
  }

  return response;
}


