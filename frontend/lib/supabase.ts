import { ENV } from '@/lib/env';

export const hasSupabasePublicConfig = () => ENV.HAS_SUPABASE;

export const supabaseRest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!ENV.HAS_SUPABASE) {
    throw new Error('Supabase public config is missing.');
  }
  const response = await fetch(`${ENV.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ENV.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase REST error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};
