import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Match',
  description:
    'Take the NemuParfang fragrance quiz to get AI-assisted perfume matches based on style, weather, occasion, and preferred accords.',
  alternates: {
    canonical: '/match',
  },
  openGraph: {
    title: 'AI Fragrance Match',
    description:
      'Take the NemuParfang fragrance quiz to get AI-assisted perfume matches based on style, weather, occasion, and preferred accords.',
    url: '/match',
  },
};

export default function MatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
