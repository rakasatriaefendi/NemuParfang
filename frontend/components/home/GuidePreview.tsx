"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Container } from '../shared/Container';
import { SectionHeader } from '../shared/SectionHeader';

export const GuidePreview = () => {
  const articles = [
    {
      id: 'art-1',
      title: 'The Art of Layering: How to Combine Fragrances',
      category: 'Olfactory Tips',
      date: 'May 24, 2026',
      img: '/assets/about-brand-story.webp',
      desc: 'Learn how to combine top, middle, and base notes to compile a custom signature scent that is completely unique to you.'
    },
    {
      id: 'art-2',
      title: 'Decoding Sillage: The Science of Scent Trail',
      category: 'Fragrance Science',
      date: 'May 10, 2026',
      img: '/assets/explore-header.webp',
      desc: 'What makes a perfume fill a room versus staying close to your skin? We break down the physics behind sillage and diffusion.'
    }
  ];

  return (
    <section className="mb-16 md:mb-24">
      <Container>
        <SectionHeader
          title="Olfactory Journal"
          subtitle="Articles"
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art) => (
            <Link
              key={art.id}
              href="#"
              className="group cursor-pointer flex flex-col sm:flex-row gap-6 bg-parfang-surface p-4 rounded-2xl border border-parfang-border/50 hover:border-parfang-accent/50 hover:shadow-md transition-all duration-300"
            >
              {/* Image box */}
              <div className="relative w-full sm:w-1/3 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-parfang-bg flex-shrink-0">
                <Image
                  src={art.img}
                  alt={art.title}
                  fill
                  sizes="(max-w-768px) 100vw, 15vw"
                  className="object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>

              {/* Text info */}
              <div className="flex flex-col justify-between py-2 text-left">
                <div>
                  <span className="font-label-caps text-[9px] uppercase tracking-wider text-parfang-accent mb-2 block font-semibold">
                    {art.category} • {art.date}
                  </span>
                  <h3 className="font-headline-sm text-lg text-parfang-text mb-2 leading-snug group-hover:text-parfang-accent transition-colors font-semibold">
                    {art.title}
                  </h3>
                  <p className="font-body text-xs text-parfang-muted leading-relaxed mb-4">
                    {art.desc}
                  </p>
                </div>
                
                <div className="flex items-center text-parfang-accent font-nav text-[9px] uppercase tracking-widest group-hover:tracking-[0.11em] transition-all duration-300 font-bold">
                  Read Article <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
};
export default GuidePreview;
