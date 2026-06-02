import { AuthSession } from '@/lib/api/auth';
import { ENV } from '@/lib/env';

export type CollectionType = 'favorite' | 'wardrobe';

export class CollectionRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CollectionRequestError';
    this.status = status;
  }
}

const headers = (session: AuthSession) => ({
  apikey: ENV.SUPABASE_ANON_KEY,
  Authorization: `Bearer ${session.accessToken}`,
  'Content-Type': 'application/json',
});

export const loadCollections = async (session: AuthSession) => {
  if (!ENV.HAS_SUPABASE) return null;
  const response = await fetch(`${ENV.SUPABASE_URL}/rest/v1/user_perfumes?select=perfume_id,collection_type&user_id=eq.${session.user.id}&order=created_at.desc`, { headers: headers(session) });
  if (response.status === 401) {
    throw new CollectionRequestError('Your session expired. Please sign in again.', 401);
  }
  if (!response.ok) return null;
  const rows = await response.json() as { perfume_id: number | string; collection_type: CollectionType }[];
  return rows.map((row) => ({
    ...row,
    perfume_id: String(row.perfume_id),
  }));
};

export const persistCollection = async (session: AuthSession, perfumeId: string, collectionType: CollectionType, active: boolean) => {
  if (!ENV.HAS_SUPABASE) return;
  const base = `${ENV.SUPABASE_URL}/rest/v1/user_perfumes`;
  const normalizedPerfumeId = Number(perfumeId);
  if (active) {
    const response = await fetch(`${base}?on_conflict=user_id,perfume_id,collection_type`, {
      method: 'POST',
      headers: { ...headers(session), Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: session.user.id, perfume_id: normalizedPerfumeId, collection_type: collectionType }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new CollectionRequestError('Your session expired. Please sign in again.', 401);
      }
      throw new CollectionRequestError(`Failed to save ${collectionType}.`, response.status);
    }
  } else {
    const response = await fetch(`${base}?user_id=eq.${session.user.id}&perfume_id=eq.${normalizedPerfumeId}&collection_type=eq.${collectionType}`, { method: 'DELETE', headers: headers(session) });
    if (!response.ok) {
      if (response.status === 401) {
        throw new CollectionRequestError('Your session expired. Please sign in again.', 401);
      }
      throw new CollectionRequestError(`Failed to remove ${collectionType}.`, response.status);
    }
  }
};
