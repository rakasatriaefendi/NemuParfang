"use client";

import React from 'react';
import { Container } from '@/components/shared/Container';
import { CollectionSection } from '@/components/profile/CollectionSection';
import { useCollections } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function FavoritesPage() {
  const { favorites } = useCollections();
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parfang-bg py-14">
      <Container>
        <div className="border-b border-parfang-border pb-8">
          <p className="font-handwrite text-3xl text-parfang-accent">Collected with intention</p>
          <h1 className="mt-2 font-display text-5xl">Favorites</h1>
          <p className="mt-3 max-w-lg font-body text-sm text-parfang-muted">
            Every saved fragrance becomes part of your evolving shortlist.
          </p>
        </div>
        <CollectionSection
          title="Saved favorites"
          perfumeIds={favorites}
          href="/favorites"
          empty="You have not saved any favorites yet."
        />
      </Container>
      </div>
    </ProtectedRoute>
  );
}
