const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'lh3.googleusercontent.com',
  },
  {
    protocol: 'https',
    hostname: 'contribution.usercontent.google.com',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'fimgs.net',
  },
];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    remotePatterns.push({
      protocol: supabaseUrl.protocol.replace(':', ''),
      hostname: supabaseUrl.hostname,
    });
  } catch {
    // Ignore malformed URLs so local development can still boot.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

export default nextConfig;
