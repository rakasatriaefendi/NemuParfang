import type { Metadata } from 'next';
import { loadPublicProfile } from '@/lib/api/profile';

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const profile = await loadPublicProfile(params.username);

  if (!profile) {
    return {
      title: 'Public Profile',
      description: 'This public profile is private or unavailable.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const displayName = profile.display_name || profile.username || 'Fragrance Seeker';
  const bio = profile.bio || `Explore ${displayName}'s shared favorites and public fragrance notes on NemuParfang.`;

  return {
    title: `${displayName} Profile`,
    description: bio,
    alternates: {
      canonical: `/u/${profile.username || params.username}`,
    },
    openGraph: {
      title: `${displayName} on NemuParfang`,
      description: bio,
      url: `/u/${profile.username || params.username}`,
      images: profile.avatar_url ? [{ url: profile.avatar_url, alt: displayName }] : undefined,
    },
  };
}

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
