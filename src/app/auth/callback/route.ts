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

      // IMPORTANT: never overwrite role here. Admin is managed manually in DB.
      // We'll insert-if-missing, then update only safe fields.
      const insertPayload = {
        id: user.id,
        display_name: displayName,
        avatar_url: avatarUrl,
      };

      const { error: insertError } = await authed
        .from('profiles')
        .insert(insertPayload, { ignoreDuplicates: true });

      const { error: updateError } = await authed
        .from('profiles')
        .update({ display_name: displayName, avatar_url: avatarUrl })
        .eq('id', user.id);

      const writeErr = insertError ?? updateError;

      if (writeErr) {
        console.error('[auth/callback] profiles write via supabase-js failed:', writeErr);

        // Fallback: call PostgREST directly to avoid any client header/session nuance.
        try {
          // insert if missing (ignore duplicates)
          const restInsert = await fetch(`${url}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=ignore-duplicates,return=minimal',
            },
            body: JSON.stringify(insertPayload),
          });

          if (!restInsert.ok && restInsert.status !== 409) {
            const text = await restInsert.text().catch(() => '');
            console.error('[auth/callback] profiles insert via REST failed:', restInsert.status, text);
          }

          // update safe fields
          const restUpdate = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, {
            method: 'PATCH',
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({ display_name: displayName, avatar_url: avatarUrl }),
          });

          if (!restUpdate.ok) {
            const text = await restUpdate.text().catch(() => '');
            console.error('[auth/callback] profiles update via REST failed:', restUpdate.status, text);
          } else {
            console.log('[auth/callback] profiles write via REST OK for user:', user.id);
          }
        } catch (e) {
          console.error('[auth/callback] profiles upsert via REST threw:', e);
        }
      } else {
        console.log('[auth/callback] profiles write OK for user:', user.id);
      }
    }
  }

  return response;
}


