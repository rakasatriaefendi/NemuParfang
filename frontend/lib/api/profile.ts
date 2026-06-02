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
    `${ENV.SUPABASE_URL}/rest/v1/profiles?select=id,username,display_name,avatar_url,bio,is_public,show_favorites,show_reviews,fragrance_dna&id=eq.${session.user.id}&limit=1`,
    { headers: profileHeaders(session), cache: 'no-store' }
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as ProfileRecord[];
  return rows[0] || null;
};

export const updateProfile = async (
  session: AuthSession,
  payload: Partial<{
    display_name: string | null;
    username: string | null;
    bio: string | null;
    avatar_url: string | null;
    is_public: boolean;
    show_favorites: boolean;
    show_reviews: boolean;
  }>
): Promise<void> => {
  if (!ENV.HAS_SUPABASE) return;
  await fetch(`${ENV.SUPABASE_URL}/rest/v1/profiles?id=eq.${session.user.id}`, {
    method: 'PATCH',
    headers: { ...profileHeaders(session), Prefer: 'return=minimal' },
    body: JSON.stringify(payload),
  });
};

export const loadPublicProfile = async (username: string): Promise<ProfileRecord | null> => {
  if (!ENV.HAS_SUPABASE) return null;
  const response = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/profiles?select=id,username,display_name,avatar_url,bio,is_public,show_favorites,show_reviews&username=eq.${encodeURIComponent(username)}&is_public=is.true&limit=1`,
    {
      headers: {
        apikey: ENV.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as ProfileRecord[];
  return rows[0] || null;
};

export const loadPublicFavoriteIds = async (profileId: string): Promise<string[]> => {
  if (!ENV.HAS_SUPABASE) return [];
  const response = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/user_perfumes?select=perfume_id&user_id=eq.${profileId}&collection_type=eq.favorite&order=created_at.desc`,
    {
      headers: {
        apikey: ENV.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );
  if (!response.ok) return [];
  const rows = (await response.json()) as { perfume_id: number | string }[];
  return rows.map((row) => String(row.perfume_id));
};
