"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PerfumeCard } from '@/components/perfume/PerfumeCard';
import { Button } from '@/components/ui/Button';
import { getPerfumeById } from '@/lib/api/perfumes';
import { Perfume } from '@/lib/types';

interface CollectionSectionProps {
  title: string;
  empty: string;
  perfumeIds: string[];
  href: string;
  previewLimit?: number;
  showLink?: boolean;
}

type CollectionSort = 'recent' | 'rating' | 'name';

export const CollectionSection: React.FC<CollectionSectionProps> = ({
  title,
  empty,
  perfumeIds,
  href,
  previewLimit,
  showLink = Boolean(previewLimit),
}) => {
  const [items, setItems] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [sortBy, setSortBy] = useState<CollectionSort>('recent');

  useEffect(() => {
    let active = true;
    const idsToLoad = previewLimit ? perfumeIds.slice(0, previewLimit) : perfumeIds;

    const fetchItems = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const results = await Promise.all(idsToLoad.map(getPerfumeById));
        if (!active) return;
        setItems(results.filter(Boolean) as Perfume[]);
      } catch {
        if (!active) return;
        setHasError(true);
        setItems([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (idsToLoad.length === 0) {
      setItems([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    fetchItems();
    return () => {
      active = false;
    };
  }, [perfumeIds, previewLimit, reloadKey]);

  const hasMore = typeof previewLimit === 'number' && perfumeIds.length > previewLimit;
  const sortedItems = useMemo(() => {
    const next = [...items];
    if (sortBy === 'rating') {
      return next.sort((left, right) => right.rating - left.rating || right.reviewCount - left.reviewCount);
    }
    if (sortBy === 'name') {
      return next.sort((left, right) => left.name.localeCompare(right.name));
    }
    return next;
  }, [items, sortBy]);
  const showSorting = !previewLimit && items.length > 1;

  return (
    <section className="border-t border-parfang-border py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">{title}</h2>
          <p className="mt-3 max-w-lg font-body text-sm text-parfang-muted">{empty}</p>
          {!isLoading && items.length > 0 && (
            <p className="mt-2 font-body text-xs text-parfang-muted">
              {items.length} fragrance{items.length === 1 ? '' : 's'} in this collection
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showSorting && (
            <label className="flex items-center gap-2 font-body text-xs text-parfang-muted">
              <span>Sort</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as CollectionSort)}
                className="rounded-full border border-parfang-border bg-parfang-surface px-3 py-1.5 text-xs text-parfang-text outline-none transition focus:border-parfang-accent"
              >
                <option value="recent">Recently added</option>
                <option value="rating">Highest rated</option>
                <option value="name">A-Z</option>
              </select>
            </label>
          )}
          {showLink && (items.length > 0 || hasMore) && (
            <Link href={href}>
              <Button variant="ghost">See more</Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(previewLimit ? Math.min(previewLimit, 4) : 4)].map((_, index) => (
            <div key={index} className="h-[390px] animate-pulse rounded-2xl border border-parfang-border bg-parfang-surface" />
          ))}
        </div>
      )}

      {!isLoading && hasError && (
        <div className="mt-7 rounded-2xl border border-parfang-border bg-parfang-surface p-8 text-center">
          <h3 className="font-display text-2xl text-parfang-text">Collection unavailable</h3>
          <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-parfang-muted">
            We could not load this collection right now. Your saved items are still preserved.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => setReloadKey((current) => current + 1)}>
              Try again
            </Button>
            <Link href="/explore">
              <Button>Explore fragrances</Button>
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !hasError && sortedItems.length > 0 && (
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sortedItems.map((item) => (
            <PerfumeCard key={item.id} perfume={item} showMatchScore={false} />
          ))}
        </div>
      )}

      {!isLoading && !hasError && sortedItems.length === 0 && (
        <div className="mt-7 rounded-2xl border border-dashed border-parfang-border bg-parfang-surface p-10 text-center">
          <h3 className="font-display text-2xl text-parfang-text">Nothing saved here yet</h3>
          <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-parfang-muted">
            {empty}
          </p>
          <div className="mt-5">
            <Link href="/explore">
              <Button>Explore fragrances</Button>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};
