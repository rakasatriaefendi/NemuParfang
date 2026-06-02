"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, Heart, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotesPyramidProps {
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
}

type LayerType = 'top' | 'middle' | 'base' | null;

export const NotesPyramid: React.FC<NotesPyramidProps> = ({ notes }) => {
  const [activeLayer, setActiveLayer] = useState<LayerType>(null);
  const totalNotes = notes.top.length + notes.middle.length + notes.base.length;
  const hasCompletePyramid = notes.top.length > 0 && notes.middle.length > 0 && notes.base.length > 0;

  const defaultAvailableLayer: LayerType =
    notes.top.length > 0 ? 'top' : notes.middle.length > 0 ? 'middle' : notes.base.length > 0 ? 'base' : null;

  const layerInfo = {
    top: {
      title: 'Top Notes (Head)',
      subtitle: 'First impression, lasts 15-30 minutes',
      icon: <Wind className="w-5 h-5 text-parfang-accent" />,
      items: notes.top,
      colorClass: 'fill-[url(#topGradient)] stroke-parfang-accent/40',
      activeColorClass: 'fill-parfang-accent/80 stroke-parfang-accent',
    },
    middle: {
      title: 'Heart Notes (Middle)',
      subtitle: 'Core scent profile, lasts 2-4 hours',
      icon: <Heart className="w-5 h-5 text-parfang-accent" />,
      items: notes.middle,
      colorClass: 'fill-[url(#middleGradient)] stroke-parfang-accent-light/40',
      activeColorClass: 'fill-parfang-accent-light/80 stroke-parfang-accent-light',
    },
    base: {
      title: 'Base Notes (Dry Down)',
      subtitle: 'Foundation, lasts 6-24 hours',
      icon: <Layers className="w-5 h-5 text-parfang-accent" />,
      items: notes.base,
      colorClass: 'fill-[url(#baseGradient)] stroke-parfang-muted/40',
      activeColorClass: 'fill-parfang-muted/80 stroke-parfang-muted',
    },
  };

  if (totalNotes === 0) {
    return (
      <div className="w-full rounded-2xl border border-parfang-border/50 bg-parfang-surface p-6 shadow-sm">
        <div className="text-left">
          <h4 className="font-headline-sm text-base text-parfang-text">Olfactory breakdown unavailable</h4>
          <p className="mt-2 font-body text-sm leading-relaxed text-parfang-muted">
            This fragrance does not have a detailed top, heart, and base note breakdown in the current dataset yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-center bg-parfang-surface p-6 rounded-2xl border border-parfang-border/50 shadow-sm">
      {/* SVG Pyramid Graphic */}
      <div className="w-full md:w-1/2 flex justify-center">
        <svg
          viewBox="0 0 220 230"
          className="w-full max-w-[280px] h-auto drop-shadow-md select-none"
        >
          <defs>
            {/* Gradients to give it a premium, elegant finish */}
            <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4B896" />
              <stop offset="100%" stopColor="#B89775" />
            </linearGradient>
            <linearGradient id="middleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F0EE" />
              <stop offset="100%" stopColor="#D4B896" />
            </linearGradient>
            <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cac6c4" />
              <stop offset="100%" stopColor="#787470" />
            </linearGradient>
          </defs>

          {/* Top Layer */}
          <g
            className={notes.top.length > 0 ? 'cursor-pointer' : 'cursor-default opacity-45'}
            onMouseEnter={() => notes.top.length > 0 && setActiveLayer('top')}
            onMouseLeave={() => setActiveLayer(null)}
          >
            <path
              d="M 110,20 L 70,90 L 150,90 Z"
              className={cn(
                'transition-all duration-300 stroke-2 paint-order-stroke',
                activeLayer === 'top' ? 'fill-parfang-accent stroke-parfang-accent' : 'fill-[url(#topGradient)] stroke-parfang-border'
              )}
            />
            <text
              x="110"
              y="70"
              textAnchor="middle"
              className={cn(
                'font-nav text-[10px] uppercase font-bold tracking-widest pointer-events-none select-none transition-colors duration-300',
                activeLayer === 'top' ? 'fill-white' : 'fill-parfang-text'
              )}
            >
              Top
            </text>
          </g>

          {/* Middle/Heart Layer */}
          <g
            className={notes.middle.length > 0 ? 'cursor-pointer' : 'cursor-default opacity-45'}
            onMouseEnter={() => notes.middle.length > 0 && setActiveLayer('middle')}
            onMouseLeave={() => setActiveLayer(null)}
          >
            <path
              d="M 67,95 L 35,152 L 185,152 L 153,95 Z"
              className={cn(
                'transition-all duration-300 stroke-2 paint-order-stroke',
                activeLayer === 'middle' ? 'fill-parfang-accent-light stroke-parfang-accent-light' : 'fill-[url(#middleGradient)] stroke-parfang-border'
              )}
            />
            <text
              x="110"
              y="130"
              textAnchor="middle"
              className={cn(
                'font-nav text-[10px] uppercase font-bold tracking-widest pointer-events-none select-none transition-colors duration-300',
                activeLayer === 'middle' ? 'fill-white' : 'fill-parfang-text'
              )}
            >
              Heart
            </text>
          </g>

          {/* Base Layer */}
          <g
            className={notes.base.length > 0 ? 'cursor-pointer' : 'cursor-default opacity-45'}
            onMouseEnter={() => notes.base.length > 0 && setActiveLayer('base')}
            onMouseLeave={() => setActiveLayer(null)}
          >
            <path
              d="M 32,157 L 0,214 L 220,214 L 188,157 Z"
              className={cn(
                'transition-all duration-300 stroke-2 paint-order-stroke',
                activeLayer === 'base' ? 'fill-parfang-muted stroke-parfang-muted' : 'fill-[url(#baseGradient)] stroke-parfang-border'
              )}
            />
            <text
              x="110"
              y="192"
              textAnchor="middle"
              className={cn(
                'font-nav text-[10px] uppercase font-bold tracking-widest pointer-events-none select-none transition-colors duration-300',
                activeLayer === 'base' ? 'fill-white' : 'fill-parfang-text'
              )}
            >
              Base
            </text>
          </g>
        </svg>
      </div>

      {/* Info Display Box */}
      <div className="w-full md:w-1/2 flex flex-col items-start text-left min-h-[160px] justify-center">
        {activeLayer ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              {layerInfo[activeLayer].icon}
              <h4 className="font-headline-sm text-lg text-parfang-text font-bold">
                {layerInfo[activeLayer].title}
              </h4>
            </div>
            <p className="font-body text-xs text-parfang-muted mb-4 leading-normal">
              {layerInfo[activeLayer].subtitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {layerInfo[activeLayer].items.map((note) => (
                <span
                  key={note}
                  className="bg-parfang-bg px-3.5 py-1.5 rounded-full font-body text-xs text-parfang-text border border-parfang-border/50 font-medium"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center md:text-left w-full">
            {hasCompletePyramid ? (
              <>
                <h4 className="font-headline-sm text-base text-parfang-text mb-2">
                  Interactive Olfactory Pyramid
                </h4>
                <p className="font-body text-xs text-parfang-muted leading-relaxed">
                  Hover over each tier of the pyramid to reveal the specific scent ingredients. Top, Heart, and Base notes compile a perfume's lifecycle.
                </p>
              </>
            ) : defaultAvailableLayer ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  {layerInfo[defaultAvailableLayer].icon}
                  <h4 className="font-headline-sm text-base text-parfang-text">
                    Partial note breakdown
                  </h4>
                </div>
                <p className="font-body text-xs text-parfang-muted leading-relaxed mb-4">
                  This fragrance does not include a complete pyramid in the current dataset. Available notes are shown below.
                </p>
                <div className="flex flex-wrap gap-2">
                  {layerInfo[defaultAvailableLayer].items.map((note) => (
                    <span
                      key={note}
                      className="bg-parfang-bg px-3.5 py-1.5 rounded-full font-body text-xs text-parfang-text border border-parfang-border/50 font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
export default NotesPyramid;
