"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Star } from 'lucide-react';
import { Perfume } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FavoriteButton } from '@/components/shared/FavoriteButton';

interface PerfumeCardProps {
  perfume: Perfume;
  showMatchScore?: boolean;
}

export const PerfumeCard: React.FC<PerfumeCardProps> = ({
  perfume,
  showMatchScore = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const displayMatchScore = showMatchScore && perfume.matchScore;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="scent-card rounded-2xl overflow-hidden bg-parfang-surface border border-parfang-border shadow-sm flex flex-col h-full relative"
    >
      {/* Match Score Badge (AI Curation Results) */}
      {displayMatchScore && (
        <div className="absolute top-4 left-4 z-20 bg-parfang-accent text-white text-[10px] font-nav uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
          {perfume.matchScore}% Match
        </div>
      )}

      {/* Image Thumbnail Stack */}
      <div className="relative aspect-square w-full overflow-hidden bg-parfang-bg cursor-pointer">
        <Link href={`/perfume/${perfume.id}`} className="block w-full h-full">
          {/* Primary Image */}
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-500 ease-in-out',
              isHovered && perfume.imageUrlSecondary ? 'opacity-0' : 'opacity-100'
            )}
          >
            <Image
              src={perfume.imageUrl || '/assets/perfume-placeholder.webp'}
              alt={perfume.name}
              fill
              sizes="(max-w-768px) 100vw, 30vw"
              className="object-cover object-center"
            />
          </div>

          {/* Secondary Image (Swap on Hover) */}
          {perfume.imageUrlSecondary && (
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-500 ease-in-out',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Image
                src={perfume.imageUrlSecondary}
                alt={`${perfume.name} secondary view`}
                fill
                sizes="(max-w-768px) 100vw, 30vw"
                className="object-cover object-center"
              />
            </div>
          )}
        </Link>

        {/* Hover Overlay Action Drawer */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 z-20 p-4 bg-gradient-to-t from-black/40 to-transparent flex gap-2 justify-center transition-all duration-300 transform',
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
          )}
        >
          <FavoriteButton perfumeId={perfume.id} compact />
          
          <Link
            href={`/perfume/${perfume.id}`}
            className="flex items-center gap-1.5 bg-white/80 text-parfang-text hover:bg-white px-4 py-2.5 rounded-full font-nav text-[10px] uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </Link>
        </div>
      </div>

      {/* Scent Info Body */}
      <div className="p-5 flex flex-col justify-between flex-grow text-left">
        <div>
          <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted mb-1 block">
            {perfume.brand}
          </span>
          <Link href={`/perfume/${perfume.id}`}>
            <h3 className="font-body font-medium text-parfang-text text-sm md:text-base hover:text-parfang-accent transition-colors leading-tight mb-2">
              {perfume.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-4">
            <div className="flex text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-body text-xs font-semibold text-parfang-text">
              {perfume.rating}
            </span>
            <span className="font-body text-[10px] text-parfang-muted">
              ({perfume.reviewCount} reviews)
            </span>
          </div>

          {/* Accords tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {perfume.accords.slice(0, 3).map((acc) => (
              <span
                key={acc.name}
                className="px-2.5 py-0.5 text-[9px] font-nav uppercase tracking-widest border border-parfang-border text-parfang-muted hover:border-parfang-accent hover:text-parfang-accent transition-colors duration-200 cursor-default"
              >
                {acc.name}
              </span>
            ))}
          </div>
        </div>

        {/* Spec footer */}
        <div className="pt-3 border-t border-parfang-border/30 flex justify-between items-center text-[10px] font-body text-parfang-muted uppercase tracking-wider">
          <span>{perfume.gender}</span>
          <span className="h-3 w-px bg-parfang-border" />
          <span>{perfume.country || perfume.year || 'Discovery'}</span>
        </div>
      </div>
    </div>
  );
};
export default PerfumeCard;
