"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Container } from '../shared/Container';

export const HeroSection = () => {
  // Stagger container definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden mb-16 md:mb-24 pt-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center min-h-[70vh]">
          {/* Left Content Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-5 flex flex-col justify-center order-2 md:order-1 z-10 pt-6 md:pt-0"
          >
            <motion.span
              variants={itemVariants}
              className="font-label-caps text-xs text-primary mb-4 uppercase tracking-[0.2em] font-semibold"
            >
              Perfume Discovery Guide
            </motion.span>
            
            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-parfang-text mb-6 leading-tight font-bold"
            >
              Skip the sniff, just click and pick!.
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="font-body text-sm md:text-base text-parfang-muted mb-10 max-w-md leading-relaxed"
            >
              Navigate the world of fine fragrance with our editorial guide. Discover scents tailored to your moments, weather, and mood without the noise.
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
            >
              <Link
                href="/match"
                className="flex items-center justify-center gap-2 bg-parfang-accent text-white px-8 py-3.5 rounded-full font-nav text-xs uppercase tracking-wider hover:bg-parfang-accent-dark transition-all duration-300 hover:shadow-lg active:scale-95 text-center"
              >
                <Sparkles className="w-4 h-4" /> Start AI Quiz
              </Link>
              <Link
                href="/explore"
                className="flex items-center justify-center gap-2 bg-transparent border-[1.5px] border-parfang-accent text-parfang-accent px-8 py-3.5 rounded-full font-nav text-xs uppercase tracking-wider hover:bg-parfang-accent hover:text-white transition-all duration-300 text-center"
              >
                Explore Notes <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image Column */}
          <div className="md:col-span-7 relative order-1 md:order-2 h-[45vh] md:h-[70vh] w-full rounded-2xl overflow-hidden group shadow-lg bg-parfang-surface">
            {/* Soft overlay */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-700 z-10 pointer-events-none" />
            
            <div className="relative w-full h-full transform transition-transform duration-[12s] ease-out group-hover:scale-105">
              <Image
                src="/assets/hero-banner.png"
                alt="A minimalist composition of a clear perfume bottle resting on a textured beige stone block. Bathed in soft, warm natural sunlight casting subtle shadows."
                fill
                priority
                sizes="(max-w-768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            {/* Floating Glass Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute bottom-4 left-4 md:bottom-8 md:left-8 glass-card p-5 rounded-xl z-20 max-w-[260px] shadow-xl"
            >
              <span className="font-label-caps text-[9px] uppercase tracking-wider text-primary mb-2 block font-semibold">
                Recommended for
              </span>
              <h3 className="font-headline-sm text-lg text-parfang-text mb-3 leading-snug">
                Evening / Cool Weather
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="chip px-2.5 py-0.5 rounded-full font-label-caps text-[9px] font-medium border border-parfang-border/50">
                  Amber
                </span>
                <span className="chip px-2.5 py-0.5 rounded-full font-label-caps text-[9px] font-medium border border-parfang-border/50">
                  Musk
                </span>
                <span className="chip px-2.5 py-0.5 rounded-full font-label-caps text-[9px] font-medium border border-parfang-border/50">
                  Vanilla
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
};
export default HeroSection;
