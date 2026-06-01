import { ENV } from '@/lib/env';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

interface SupabaseAuthPayload {
  access_token?: string;
  refresh_token?: string;
  user?: { id: string; email?: string };
  error_description?: string;
  msg?: string;
}

const authRequest = async (path: string, body: object): Promise<SupabaseAuthPayload> => {
  if (!ENV.HAS_SUPABASE) {
    throw new Error('Supabase belum dikonfigurasi. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  const response = await fetch(`${ENV.SUPABASE_URL}/auth/v1${path}`, {
    method: 'POST',
    headers: {
      apikey: ENV.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as SupabaseAuthPayload;
  if (!response.ok) throw new Error(payload.error_description || payload.msg || 'Autentikasi gagal.');
  return payload;
};

const toSession = (payload: SupabaseAuthPayload): AuthSession => {
  if (!payload.access_token || !payload.user?.id || !payload.user.email) {
    throw new Error('Periksa email untuk konfirmasi akun sebelum login.');
  }
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    user: { id: payload.user.id, email: payload.user.email },
  };
};

export const signIn = async (email: string, password: string) =>
  toSession(await authRequest('/token?grant_type=password', { email, password }));

export const signUp = async (email: string, password: string, displayName: string) =>
  toSession(await authRequest('/signup', { email, password, data: { display_name: displayName } }));
