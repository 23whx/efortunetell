import type { SupabaseClient } from '@supabase/supabase-js';

export type ProfileRole = 'user' | 'admin';

export type ProfileRow = {
  id: string;
  role: ProfileRole;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export async function getMyProfile(supabase: SupabaseClient) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { user: null, profile: null, role: null as ProfileRole | null };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;

  return {
    user,
    profile: profile as ProfileRow | null,
    role: (profile?.role as ProfileRole | null) ?? null,
  };
}

export async function ensureMyProfile(
  supabase: SupabaseClient,
  input?: { display_name?: string | null }
) {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error('Not signed in');

  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return;

  const fallbackName =
    input?.display_name ??
    (user.email ? user.email.split('@')[0] : null);

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    role: 'user',
    display_name: fallbackName,
    avatar_url: null,
  });
  if (error) throw error;
}


