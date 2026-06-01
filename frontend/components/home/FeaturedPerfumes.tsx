"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Container } from '../shared/Container';

export const FeaturedPerfumes = () => {
  return (
    <section className="mb-16 md:mb-24 py-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Left Column: Fragrance Image */}
          <div className="md:col-span-6 relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg bg-parfang-surface group">
            <Image
              src="/assets/fragrance-notes-visual.png"
              alt="Amber Veil Luxury decanter resting on raw elements like amber resin and dried lavender petals, bathed in warm sunset shadows."
              fill
              sizes="(max-w-768px) 100vw, 50vw"
              className="object-cover group-hover:scale-102 transition-transform duration-[8s] ease-in-out"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
          </div>

          {/* Right Column: Profile Specs */}
          <div className="md:col-span-5 md:col-start-8 flex flex-col items-start text-left">
            <span className="font-label-caps text-xs text-primary mb-4 uppercase tracking-[0.2em] font-semibold">
              Featured Profile
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-parfang-text mb-2 font-bold leading-tight">
              Amber Veil
            </h2>
            <p className="font-nav text-xs uppercase tracking-wider text-parfang-muted mb-6">
              Unisex • Eau de Parfum
            </p>
            
            {/* Editorial quote */}
            <div className="mb-8 border-l-[3px] border-parfang-accent pl-6 py-2">
              <p className="font-body text-sm md:text-base text-parfang-muted italic leading-relaxed">
                "A seamless blend of warm resin and soft musk. It opens with a whisper of fresh citrus and lavender before settling into a deep, comforting embrace of vanilla and amber resin."
              </p>
            </div>

            {/* Key Accords list */}
            <div className="mb-8 w-full">
              <h4 className="font-label-caps text-xs uppercase tracking-wider text-parfang-text font-bold mb-3">
                Key Accords
              </h4>
              <div className="flex gap-2">
                <span className="chip px-4 py-2 rounded-full font-nav text-[10px] uppercase tracking-wider border border-parfang-border">
                  Amber
                </span>
                <span className="chip px-4 py-2 rounded-full font-nav text-[10px] uppercase tracking-wider border border-parfang-border">
                  Vanilla
                </span>
                <span className="chip px-4 py-2 rounded-full font-nav text-[10px] uppercase tracking-wider border border-parfang-border">
                  Musk
                </span>
              </div>
            </div>

            {/* Best suited conditions */}
            <div className="mb-10 text-left">
              <h4 className="font-label-caps text-xs uppercase tracking-wider text-parfang-text font-bold mb-2">
                Best Suited For
              </h4>
              <p className="font-body text-sm text-parfang-muted">
                Evening Wear, Cool Climates, Date Nights
              </p>
            </div>

            <Link
              href="/perfume/amber-veil"
              className="inline-flex items-center gap-1.5 text-parfang-accent font-nav text-xs uppercase tracking-widest border-b-[1.5px] border-parfang-accent pb-1 hover:text-parfang-accent-dark hover:border-parfang-accent-dark transition-all duration-300"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};
export default FeaturedPerfumes;
