import './globals.css';
import React from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'NemuParfang - AI Fragrance Discovery',
  description: 'Skip the sniff, just click and pick!  Discover fragrances, notes, and accords with a calmer AI-assisted experience.',
  keywords: 'perfume, fragrance, scent, AI recommendation, fragrance discovery, notes, accords, unisex',
  icons: {
    icon: [
      { url: '/assets/favicon_io/favicon.ico' },
      { url: '/assets/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/assets/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/assets/favicon_io/favicon.ico'],
  },
  manifest: '/assets/favicon_io/site.webmanifest',
  openGraph: {
    title: 'NemuParfang - AI Fragrance Discovery',
    description: 'Skip the sniff, just click and pick!  Discover fragrances, notes, and accords with a calmer AI-assisted experience.',
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
    description: 'Skip the sniff, just click and pick!  Discover fragrances, notes, and accords with a calmer AI-assisted experience.',
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
