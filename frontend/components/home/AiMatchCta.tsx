"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Container } from '../shared/Container';

export const AiMatchCta = () => {
  const chips = ['Office', 'Hot Weather', 'Fresh', 'Elegant', 'Spicy', 'Date Night'];

  return (
    <section className="mb-16 md:mb-24">
      <Container>
        <div className="bg-surface-container-low rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 border border-outline-variant/20 shadow-sm relative overflow-hidden">
          {/* Subtle glow elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-parfang-accent-light/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-parfang-accent-dark/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Left Text Area */}
          <div className="md:w-1/2 z-10 flex flex-col items-start text-left">
            <h2 className="font-headline-md text-3xl md:text-4xl text-parfang-text mb-4 leading-tight">
              Let AI match your scent.
            </h2>
            <p className="font-body text-sm md:text-base text-parfang-muted mb-8 max-w-md leading-relaxed">
              Tell us your typical day, preferred climate, and lifestyle preferences. Our scent algorithm will compile a custom Fragrance DNA profile just for you.
            </p>
            <Link
              href="/match"
              className="flex items-center gap-2 bg-parfang-accent text-white px-8 py-3.5 rounded-full font-nav text-xs uppercase tracking-wider hover:bg-parfang-accent-dark transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> Start AI Quiz
            </Link>
          </div>

          {/* Right Floating Chips Grid */}
          <div className="md:w-1/2 flex flex-wrap gap-3 z-10 justify-center md:justify-end max-w-md">
            {chips.map((chip, index) => (
              <motion.span
                key={chip}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -3, scale: 1.05 }}
                className="bg-parfang-surface px-6 py-2.5 rounded-full font-nav text-xs tracking-wider text-parfang-text border border-parfang-border shadow-sm cursor-default hover:border-parfang-accent transition-all duration-300"
              >
                {chip}
              </motion.span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
export default AiMatchCta;
