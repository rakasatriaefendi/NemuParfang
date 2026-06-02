import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { hasSupabasePublicConfig, supabaseRest } from '@/lib/supabase';

interface SitemapPerfumeRow {
  id: number;
}

interface SitemapProfileRow {
  username: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/explore'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: absoluteUrl('/community'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: absoluteUrl('/match'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/mood'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
  ];

  if (!hasSupabasePublicConfig()) {
    return entries;
  }

  try {
    const [perfumes, profiles] = await Promise.all([
      supabaseRest<SitemapPerfumeRow[]>(
        'perfumes?select=id&order=review_count.desc&limit=200'
      ),
      supabaseRest<SitemapProfileRow[]>(
        'profiles?select=username&is_public=is.true&username=not.is.null&limit=100'
      ),
    ]);

    entries.push(
      ...perfumes.map((perfume) => ({
        url: absoluteUrl(`/perfume/${perfume.id}`),
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    );

    entries.push(
      ...profiles
        .filter((profile) => profile.username)
        .map((profile) => ({
          url: absoluteUrl(`/u/${profile.username}`),
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })),
    );
  } catch {
    return entries;
  }

  return entries;
}
