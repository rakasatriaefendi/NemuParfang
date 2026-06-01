"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, Sun, Heart, Award, Flame } from 'lucide-react';
import { Container } from '../shared/Container';
import { SectionHeader } from '../shared/SectionHeader';

export const OccasionSection = () => {
  const router = useRouter();

  const handleOccasionClick = (occasion: string) => {
    router.push(`/explore?occasion=${encodeURIComponent(occasion)}`);
  };

  const standardOccasions = [
    { name: 'Daily Wear', icon: <Sun className="w-8 h-8 text-parfang-accent mb-3 group-hover:scale-110 transition-transform duration-300" />, bg: '/assets/occasion-casual.png' },
    { name: 'Date Night', icon: <Heart className="w-8 h-8 text-parfang-accent mb-3 group-hover:scale-110 transition-transform duration-300" />, bg: '/assets/occasion-date-night.png' },
    { name: 'Formal Event', icon: <Award className="w-8 h-8 text-parfang-accent mb-3 group-hover:scale-110 transition-transform duration-300" />, bg: '/assets/occasion-formal.png' },
    { name: 'Sport / Gym', icon: <Flame className="w-8 h-8 text-parfang-accent mb-3 group-hover:scale-110 transition-transform duration-300" />, bg: '/assets/occasion-hot-water.png' },
  ];

  return (
    <section className="mb-16 md:mb-24">
      <Container>
        <SectionHeader
          title="Curated Occasions"
          subtitle="Situations"
          align="left"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* 1. Large Card: Work / Office */}
          <div
            onClick={() => handleOccasionClick('Work / Office')}
            className="col-span-2 row-span-2 scent-card rounded-2xl p-8 flex flex-col justify-end min-h-[300px] md:min-h-[380px] relative overflow-hidden group cursor-pointer"
          >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent z-10" />
            
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: "url('/assets/occasion-office.png')" }}
            />
            
            <div className="relative z-20 flex flex-col items-start text-left">
              <Briefcase className="w-6 h-6 text-parfang-accent mb-3" />
              <h3 className="font-headline-sm text-2xl text-white mb-2 font-semibold">
                Work / Office
              </h3>
              <p className="font-body text-xs md:text-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 max-w-xs">
                Subtle, professional, clean, and long-lasting. Perfect for making a statement without overwhelming.
              </p>
            </div>
          </div>

          {/* 2. Standard Grid Cards */}
          {standardOccasions.map((occ) => (
            <motion.div
              key={occ.name}
              whileHover={{ y: -4 }}
              onClick={() => handleOccasionClick(occ.name)}
              className="scent-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[150px] md:min-h-[180px] text-center cursor-pointer group bg-parfang-surface relative overflow-hidden"
            >
              {/* Subtle background scale effect */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                style={{ backgroundImage: `url('${occ.bg}')` }}
              />
              <div className="relative z-10 flex flex-col items-center">
                {occ.icon}
                <h3 className="font-nav text-xs uppercase tracking-wider text-parfang-text font-semibold group-hover:text-parfang-accent transition-colors duration-300">
                  {occ.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};
export default OccasionSection;
