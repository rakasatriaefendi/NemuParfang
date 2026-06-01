"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithSkeletonProps extends ImageProps {
  wrapperClassName?: string;
  skeletonClassName?: string;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  className,
  wrapperClassName,
  skeletonClassName,
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn('relative h-full w-full overflow-hidden', wrapperClassName)}>
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 animate-pulse bg-gradient-to-br from-parfang-border via-parfang-surface to-parfang-border transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100',
          skeletonClassName
        )}
      />
      <Image
        {...props}
        className={cn(
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
      />
    </div>
  );
};
