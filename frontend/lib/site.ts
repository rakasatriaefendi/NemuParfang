const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nemu-parfang.vercel.app';

export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');
export const SITE_ORIGIN = new URL(SITE_URL);

export const absoluteUrl = (path = '/') => {
  if (!path.startsWith('/')) {
    return `${SITE_URL}/${path}`;
  }
  return `${SITE_URL}${path}`;
};
