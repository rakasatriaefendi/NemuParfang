import './globals.css';
import React from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'NemuParfang - AI Fragrance Discovery',
  description: 'Skip the sniff, just pick and click! Discover fragrances, notes, and accords with a calmer AI-assisted experience.',
  keywords: 'perfume, fragrance, scent, AI recommendation, fragrance discovery, notes, accords, unisex',
  openGraph: {
    title: 'NemuParfang - AI Fragrance Discovery',
    description: 'Skip the sniff, just pick and click! Discover fragrances, notes, and accords with a calmer AI-assisted experience.',
    type: 'website',
    url: 'https://nemuparfang.com',
    images: [
      {
        url: '/assets/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'NemuParfang Scent Discovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NemuParfang - AI Fragrance Discovery',
    description: 'Skip the sniff, just pick and click! Discover fragrances, notes, and accords with a calmer AI-assisted experience.',
    images: ['/assets/og-image.webp'],
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
