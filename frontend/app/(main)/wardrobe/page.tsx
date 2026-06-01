"use client";

import React from 'react';
import { Container } from '@/components/shared/Container';
import { CollectionSection } from '@/components/profile/CollectionSection';
import { useCollections } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function WardrobePage() {
  const { wardrobe } = useCollections();
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parfang-bg py-14">
      <Container>
        <div className="border-b border-parfang-border pb-8">
          <p className="font-handwrite text-3xl text-parfang-accent">A record of what stays with you</p>
          <h1 className="mt-2 font-display text-5xl">My Wardrobe</h1>
          <p className="mt-3 max-w-lg font-body text-sm text-parfang-muted">
            Keep your owned and tracked fragrances in one calm place.
          </p>
        </div>
        <CollectionSection
          title="Wardrobe items"
          perfumeIds={wardrobe}
          href="/wardrobe"
          empty="Your wardrobe is empty for now."
        />
      </Container>
      </div>
    </ProtectedRoute>
  );
}
