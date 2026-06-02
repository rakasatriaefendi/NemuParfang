"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  interactive?: boolean;
  className?: string;
}

export const ReviewStars: React.FC<ReviewStarsProps> = ({
  value,
  onChange,
  size = 18,
  interactive = false,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const selected = starValue <= displayValue;
        const src = selected ? '/assets/selected-star.webp' : '/assets/unselected-star.webp';

        if (!interactive || !onChange) {
          return (
            <Image
              key={starValue}
              src={src}
              alt={selected ? `${starValue} selected stars` : `${starValue} unselected stars`}
              width={size}
              height={size}
              className="shrink-0"
            />
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(null)}
            onClick={() => onChange(starValue)}
            className="rounded-sm transition-transform hover:scale-105 active:scale-95"
            aria-label={`Rate ${starValue} out of 5`}
          >
            <Image
              src={src}
              alt={`${starValue} star`}
              width={size}
              height={size}
              className="shrink-0"
            />
          </button>
        );
      })}
    </div>
  );
};
