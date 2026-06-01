import { AuthSession } from '@/lib/api/auth';
import { ENV } from '@/lib/env';
import { ProfileRecord } from '@/lib/types';

const profileHeaders = (session: AuthSession) => ({
  apikey: ENV.SUPABASE_ANON_KEY,
  Authorization: `Bearer ${session.accessToken}`,
  'Content-Type': 'application/json',
});

export const loadProfile = async (session: AuthSession): Promise<ProfileRecord | null> => {
  if (!ENV.HAS_SUPABASE) return null;
  const response = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/profiles?select=id,username,display_name,avatar_url,bio,fragrance_dna&id=eq.${session.user.id}&limit=1`,
    { headers: profileHeaders(session), cache: 'no-store' }
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as ProfileRecord[];
  return rows[0] || null;
};

export const updateProfile = async (
  session: AuthSession,
  payload: Pick<ProfileRecord, 'display_name' | 'username'>
): Promise<void> => {
  if (!ENV.HAS_SUPABASE) return;
  await fetch(`${ENV.SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}`, {
    method: 'PATCH',
    headers: { ...profileHeaders(session), Prefer: 'return=minimal' },
    body: JSON.stringify(payload),
  });
};
