"use client";

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAuthSession, useCollections } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';

export const FavoriteButton: React.FC<{ perfumeId: string; compact?: boolean }> = ({ perfumeId, compact }) => {
  const { session } = useAuthSession();
  const { favorites, toggleFavorite } = useCollections();
  const active = favorites.includes(perfumeId);

  if (!session) {
    return (
      <Link href="/login" aria-label="Login untuk menyimpan favorit" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-parfang-text hover:text-parfang-accent">
        <Heart className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-label={active ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      aria-pressed={active}
      onClick={() => toggleFavorite(perfumeId)}
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border transition-all duration-150',
        active
          ? 'border-parfang-accent bg-parfang-accent text-white shadow-sm'
          : 'border-parfang-border bg-white/90 text-parfang-text hover:border-parfang-accent hover:text-parfang-accent',
        compact && 'min-h-10 min-w-10'
      )}
    >
      <Heart className={cn('h-4 w-4', active && 'fill-current')} />
    </button>
  );
};
