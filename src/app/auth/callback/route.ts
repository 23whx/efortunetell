import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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
  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error);
  } else {
    const session = data.session;
    const user = data.user ?? session?.user;

    if (!session?.access_token || !user) {
      console.warn('[auth/callback] No session/user after exchangeCodeForSession', {
        hasSession: Boolean(session),
        hasAccessToken: Boolean(session?.access_token),
        hasUser: Boolean(user),
      });
    } else {
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

      const upsertPayload = {
        id: user.id,
        role: 'user' as const,
        display_name: displayName,
        avatar_url: avatarUrl,
      };

      const { error: upsertError } = await authed.from('profiles').upsert(
        {
          ...upsertPayload,
        },
        { onConflict: 'id' }
      );

      if (upsertError) {
        console.error('[auth/callback] profiles upsert via supabase-js failed:', upsertError);

        // Fallback: call PostgREST directly to avoid any client header/session nuance.
        try {
          const restRes = await fetch(`${url}/rest/v1/profiles?on_conflict=id`, {
            method: 'POST',
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=minimal',
            },
            body: JSON.stringify(upsertPayload),
          });

          if (!restRes.ok) {
            const text = await restRes.text().catch(() => '');
            console.error('[auth/callback] profiles upsert via REST failed:', restRes.status, text);
          } else {
            console.log('[auth/callback] profiles upsert via REST OK for user:', user.id);
          }
        } catch (e) {
          console.error('[auth/callback] profiles upsert via REST threw:', e);
        }
      } else {
        console.log('[auth/callback] profiles upsert OK for user:', user.id);
      }
    }
  }

  return response;
}


