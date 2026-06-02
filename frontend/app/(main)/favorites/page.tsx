"use client";

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { CollectionSection } from '@/components/profile/CollectionSection';
import { useAuthSession, useCollections } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';

export default function FavoritesPage() {
  const { isReady } = useAuthSession();
  const { favorites } = useCollections();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parfang-bg py-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-parfang-border pb-8">
            <div>
              <p className="font-handwrite text-3xl text-parfang-accent">Collected with intention</p>
              <h1 className="mt-2 font-display text-5xl">Favorites</h1>
              <p className="mt-3 max-w-lg font-body text-sm text-parfang-muted">
                Every saved fragrance becomes part of your evolving shortlist.
              </p>
            </div>
            <div className="rounded-full border border-parfang-border bg-parfang-surface px-4 py-2 text-right">
              <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Saved count</p>
              <p className="mt-1 font-display text-2xl text-parfang-text">
                {isReady ? favorites.length.toLocaleString() : '…'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost">Back to Profile</Button>
            </Link>
            <Link href="/explore">
              <Button>Find more fragrances</Button>
            </Link>
          </div>

          <CollectionSection
            title="Saved favorites"
            perfumeIds={favorites}
            href="/favorites"
            empty="You have not saved any favorites yet."
            showLink={false}
          />
        </Container>
      </div>
    </ProtectedRoute>
  );
}
