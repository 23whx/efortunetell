import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CONTACT_EMAIL } from '@/lib/site';

/** Calls per registered user per day, shared across all AI endpoints (DeepSeek / embeddings). */
export const DAILY_AI_LIMIT = 1;

/**
 * Atomically consumes one AI call for the signed-in user (see supabase migration 20261014).
 * Fails closed: if the RPC errors (e.g. migration not applied) the call is refused.
 */
export async function consumeAiQuota(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc('consume_ai_quota', { p_limit: DAILY_AI_LIMIT });
  if (error) {
    console.error('[ai-quota] consume_ai_quota failed:', error);
    return false;
  }
  return data === true;
}

export function quotaExceededResponse() {
  return NextResponse.json(
    { error: 'quota_exceeded', limit: DAILY_AI_LIMIT, contact: CONTACT_EMAIL },
    { status: 429 }
  );
}
