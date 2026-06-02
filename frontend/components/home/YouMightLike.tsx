"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useCollections } from '@/components/auth/AuthProvider';
import { Container } from '@/components/shared/Container';
import { PerfumeCard } from '@/components/perfume/PerfumeCard';
import { Button } from '@/components/ui/Button';
import { getYouMightLike } from '@/lib/api/recommendations';
import { Perfume } from '@/lib/types';

export const YouMightLike = () => {
  const { favorites } = useCollections();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchRecommendations = async () => {
      if (favorites.length === 0) {
        setPerfumes([]);
        setHasError(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      try {
        const result = await getYouMightLike(favorites);
        if (!active) return;
        setPerfumes(result);
        setIsLoading(false);
      } catch {
        if (!active) return;
        setPerfumes([]);
        setHasError(true);
        setIsLoading(false);
      }
    };

    fetchRecommendations();
    return () => {
      active = false;
    };
  }, [favorites]);

  return (
    <section className="mb-16 border-y border-parfang-border/40 bg-parfang-surface/40 py-14 md:mb-24">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="text-left">
            <span className="font-label-caps text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              From Your Collection
            </span>
            <h2 className="mt-3 font-display text-3xl text-parfang-text md:text-4xl">You might like</h2>
            <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-parfang-muted">
              A lightweight recommendation pass based on the accords and notes that keep appearing in your saved favorites.
            </p>
          </div>
          <Link href="/favorites">
            <Button variant="ghost">View favorites</Button>
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-parfang-border bg-parfang-bg p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-parfang-surface text-parfang-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-2xl text-parfang-text">Save a few favorites first</h3>
            <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-parfang-muted">
              Once you start saving fragrances, we can suggest nearby scent profiles using their shared accords and note structure.
            </p>
            <div className="mt-5">
              <Link href="/explore">
                <Button>Explore fragrances</Button>
              </Link>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-[390px] animate-pulse rounded-2xl border border-parfang-border bg-parfang-bg" />
            ))}
          </div>
        ) : hasError ? (
          <div className="rounded-2xl border border-parfang-border bg-parfang-bg p-10 text-center">
            <h3 className="font-display text-2xl text-parfang-text">Recommendation unavailable</h3>
            <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-parfang-muted">
              We could not build your collection-based suggestions right now. Your saved favorites are still intact.
            </p>
          </div>
        ) : perfumes.length === 0 ? (
          <div className="rounded-2xl border border-parfang-border bg-parfang-bg p-10 text-center">
            <h3 className="font-display text-2xl text-parfang-text">Not enough overlap yet</h3>
            <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-parfang-muted">
              Save a few more fragrances with distinct scent styles and we will surface better matches from the library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perfumes.map((perfume) => (
              <PerfumeCard key={perfume.id} perfume={perfume} showMatchScore={false} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

export default YouMightLike;
