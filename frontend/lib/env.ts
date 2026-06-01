export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL?.trim() || '',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  IS_DEV: process.env.NODE_ENV === 'development',
  HAS_REMOTE_API: Boolean(process.env.NEXT_PUBLIC_API_URL?.trim()),
  HAS_SUPABASE:
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};
