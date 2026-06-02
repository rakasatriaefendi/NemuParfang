import type { Metadata } from 'next';
import { getPerfumeById } from '@/lib/api/perfumes';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const perfume = await getPerfumeById(params.id);

  if (!perfume) {
    return {
      title: 'Perfume',
      description: 'Fragrance detail page on NemuParfang.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const accords = perfume.accords.slice(0, 3).map((accord) => accord.name).join(', ');
  const description =
    perfume.description ||
    `${perfume.name} by ${perfume.brand} with ${accords || 'signature'} accords on NemuParfang.`;

  return {
    title: `${perfume.name} by ${perfume.brand}`,
    description,
    alternates: {
      canonical: `/perfume/${params.id}`,
    },
    openGraph: {
      title: `${perfume.name} by ${perfume.brand}`,
      description,
      url: `/perfume/${params.id}`,
      images: perfume.imageUrl ? [{ url: perfume.imageUrl, alt: `${perfume.name} bottle image` }] : undefined,
    },
  };
}

export default function PerfumeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
