import { AuthSession } from '@/lib/api/auth';
import { ENV } from '@/lib/env';
import { MOCK_REVIEWS } from '@/lib/mock-data';
import { Review } from '@/lib/types';

interface ReviewRow {
  id: string;
  user_id: string;
  perfume_id: number;
  rating: number;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  created_at: string;
  updated_at?: string | null;
}

const reviewHeaders = (session?: AuthSession) => ({
  apikey: ENV.SUPABASE_ANON_KEY,
  ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
  'Content-Type': 'application/json',
});

const formatReviewDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

const mapReview = (row: ReviewRow, viewerId?: string): Review => ({
  id: row.id,
  userId: row.user_id,
  userName: viewerId === row.user_id ? 'You' : 'Fragrance Seeker',
  rating: row.rating,
  content: row.content,
  sentiment: row.sentiment || undefined,
  date: formatReviewDate(row.created_at),
});

export const loadReviews = async (perfumeId: string, viewerId?: string): Promise<Review[]> => {
  if (!ENV.HAS_SUPABASE) {
    return MOCK_REVIEWS[perfumeId] || [];
  }

  const response = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/reviews?select=id,user_id,perfume_id,rating,content,sentiment,created_at,updated_at&perfume_id=eq.${Number(perfumeId)}&order=created_at.desc`,
    {
      headers: reviewHeaders(),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load reviews: ${response.status} ${response.statusText}`);
  }

  const rows = (await response.json()) as ReviewRow[];
  return rows.map((row) => mapReview(row, viewerId));
};

export const persistReview = async (
  session: AuthSession,
  perfumeId: string,
  payload: {
    reviewId?: string;
    rating: number;
    content: string;
  }
): Promise<void> => {
  if (!ENV.HAS_SUPABASE) return;

  const body = JSON.stringify({
    user_id: session.user.id,
    perfume_id: Number(perfumeId),
    rating: payload.rating,
    content: payload.content.trim(),
  });

  if (payload.reviewId) {
    const response = await fetch(
      `${ENV.SUPABASE_URL}/rest/v1/reviews?id=eq.${payload.reviewId}&user_id=eq.${session.user.id}`,
      {
        method: 'PATCH',
        headers: {
          ...reviewHeaders(session),
          Prefer: 'return=minimal',
        },
        body,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update review.');
    }
    return;
  }

  const response = await fetch(`${ENV.SUPABASE_URL}/rest/v1/reviews`, {
    method: 'POST',
    headers: {
      ...reviewHeaders(session),
      Prefer: 'return=minimal',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Failed to submit review.');
  }
};

export const removeReview = async (session: AuthSession, reviewId: string): Promise<void> => {
  if (!ENV.HAS_SUPABASE) return;

  const response = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/reviews?id=eq.${reviewId}&user_id=eq.${session.user.id}`,
    {
      method: 'DELETE',
      headers: reviewHeaders(session),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete review.');
  }
};

export const loadUserReviews = async (userId: string): Promise<Review[]> => {
  if (!ENV.HAS_SUPABASE) return [];

  const response = await fetch(
    `${ENV.SUPABASE_URL}/rest/v1/reviews?select=id,user_id,perfume_id,rating,content,sentiment,created_at,updated_at&user_id=eq.${userId}&order=created_at.desc&limit=8`,
    {
      headers: reviewHeaders(),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load user reviews: ${response.status} ${response.statusText}`);
  }

  const rows = (await response.json()) as ReviewRow[];
  return rows.map((row) => mapReview(row));
};
