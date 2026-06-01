import './globals.css';
import React from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'NemuParfang — Premium AI Fragrance Discovery',
  description: 'Skip the sniff, just click and pick! An elegant, minimal, and premium fragrance discovery platform powered by AI.',
  keywords: 'perfume, fragrance, scent, AI recommendation, fragrance discovery, notes, accords, unisex',
  openGraph: {
    title: 'NemuParfang — Premium AI Fragrance Discovery',
    description: 'Skip the sniff, just click and pick! An elegant, minimal, and premium fragrance discovery platform powered by AI.',
    type: 'website',
    url: 'https://nemuparfang.com',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NemuParfang Scent Discovery',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-parfang-bg text-parfang-text">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
