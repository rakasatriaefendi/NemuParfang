import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Read and share scent thoughts, bottle photos, favorites, and public profiles in the NemuParfang fragrance community.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'NemuParfang Community',
    description:
      'Read and share scent thoughts, bottle photos, favorites, and public profiles in the NemuParfang fragrance community.',
    url: '/community',
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
