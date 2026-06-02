import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Fragrances',
  description:
    'Browse the NemuParfang perfume library by brand, notes, accords, gender, and rating with a catalog built for deliberate fragrance discovery.',
  alternates: {
    canonical: '/explore',
  },
  openGraph: {
    title: 'Explore Fragrances',
    description:
      'Browse the NemuParfang perfume library by brand, notes, accords, gender, and rating with a catalog built for deliberate fragrance discovery.',
    url: '/explore',
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
