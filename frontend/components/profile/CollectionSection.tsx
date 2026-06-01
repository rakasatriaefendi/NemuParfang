"use client";

import React, { useEffect, useState } from 'react';
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

export const CollectionSection: React.FC<CollectionSectionProps> = ({
  title,
  empty,
  perfumeIds,
  href,
  previewLimit,
  showLink = Boolean(previewLimit),
}) => {
  const [items, setItems] = useState<Perfume[]>([]);

  useEffect(() => {
    Promise.all((previewLimit ? perfumeIds.slice(0, previewLimit) : perfumeIds).map(getPerfumeById)).then((results) =>
      setItems(results.filter(Boolean) as Perfume[])
    );
  }, [perfumeIds, previewLimit]);

  const hasMore = typeof previewLimit === 'number' && perfumeIds.length > previewLimit;

  return (
    <section className="border-t border-parfang-border py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">{title}</h2>
          <p className="mt-3 max-w-lg font-body text-sm text-parfang-muted">{empty}</p>
        </div>
        {showLink && (items.length > 0 || hasMore) && (
          <Link href={href}>
            <Button variant="ghost">See more</Button>
          </Link>
        )}
      </div>
      {items.length > 0 && (
        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <PerfumeCard key={item.id} perfume={item} showMatchScore={false} />
          ))}
        </div>
      )}
    </section>
  );
};
