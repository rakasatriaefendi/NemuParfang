import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mood Discovery',
  description:
    'Explore fragrances through mood, atmosphere, and emotional tone with NemuParfang mood-based scent discovery.',
  alternates: {
    canonical: '/mood',
  },
  openGraph: {
    title: 'Mood Fragrance Discovery',
    description:
      'Explore fragrances through mood, atmosphere, and emotional tone with NemuParfang mood-based scent discovery.',
    url: '/mood',
  },
};

export default function MoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
