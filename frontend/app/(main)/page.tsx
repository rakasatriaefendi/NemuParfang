import React from 'react';
import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import AiMatchCta from '@/components/home/AiMatchCta';
import OccasionSection from '@/components/home/OccasionSection';
import NotesSection from '@/components/home/NotesSection';
import WeatherRecommendation from '@/components/home/WeatherRecommendation';
import FeaturedPerfumes from '@/components/home/FeaturedPerfumes';
import GuidePreview from '@/components/home/GuidePreview';
import YouMightLike from '@/components/home/YouMightLike';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover perfumes, notes, accords, and personal fragrance recommendations through a calmer catalog and scent journal experience.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NemuParfang - AI Fragrance Discovery',
    description:
      'Discover perfumes, notes, accords, and personal fragrance recommendations through a calmer catalog and scent journal experience.',
    url: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AiMatchCta />
      <OccasionSection />
      <NotesSection />
      <WeatherRecommendation />
      <YouMightLike />
      <FeaturedPerfumes />
      <GuidePreview />
    </>
  );
}
