import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import AiMatchCta from '@/components/home/AiMatchCta';
import OccasionSection from '@/components/home/OccasionSection';
import NotesSection from '@/components/home/NotesSection';
import WeatherRecommendation from '@/components/home/WeatherRecommendation';
import FeaturedPerfumes from '@/components/home/FeaturedPerfumes';
import GuidePreview from '@/components/home/GuidePreview';
import YouMightLike from '@/components/home/YouMightLike';

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
