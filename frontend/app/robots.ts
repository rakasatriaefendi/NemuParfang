import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: ['/login', '/register', '/profile', '/favorites', '/wardrobe'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}