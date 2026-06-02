"use client";

import React from 'react';
import Link from 'next/link';
import { LogOut, Sparkles, Heart, BriefcaseBusiness } from 'lucide-react';
import { useAuthSession, useCollections } from '@/components/auth/AuthProvider';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/Button';
import { CollectionSection } from '@/components/profile/CollectionSection';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const { session, profile, signOut, isReady } = useAuthSession();
  const { favorites, wardrobe } = useCollections();

  const displayName = profile?.display_name || session?.user.displayName || session?.user.email;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-parfang-bg py-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-parfang-border pb-8">
            <div>
              <p className="font-handwrite text-3xl text-parfang-accent">Your scent archive</p>
              <h1 className="mt-2 font-display text-5xl">Fragrance Journal</h1>
              <p className="mt-3 font-body text-sm text-parfang-muted">{displayName}</p>
              <p className="mt-1 font-body text-xs text-parfang-muted">{session?.user.email}</p>
            </div>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>

          <section className="grid gap-4 py-8 md:grid-cols-3">
            <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-parfang-bg p-2 text-parfang-accent">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Favorites</p>
                  <p className="mt-1 font-display text-3xl text-parfang-text">
                    {isReady ? favorites.length.toLocaleString() : '…'}
                  </p>
                </div>
              </div>
              <Link href="/favorites" className="mt-4 inline-block font-nav text-[10px] uppercase tracking-widest text-parfang-accent">
                Open favorites
              </Link>
            </div>

            <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-parfang-bg p-2 text-parfang-accent">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Wardrobe</p>
                  <p className="mt-1 font-display text-3xl text-parfang-text">
                    {isReady ? wardrobe.length.toLocaleString() : '…'}
                  </p>
                </div>
              </div>
              <Link href="/wardrobe" className="mt-4 inline-block font-nav text-[10px] uppercase tracking-widest text-parfang-accent">
                Open wardrobe
              </Link>
            </div>

            <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-5">
              <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-accent">Fragrance DNA</p>
              <h2 className="mt-3 font-display text-2xl text-parfang-text">Refine your olfactory signature.</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-parfang-muted">
                Keep building your taste profile as your collection and reviews grow.
              </p>
              <Link href="/match" className="mt-5 inline-block">
                <Button>
                  <Sparkles className="h-4 w-4" /> Start AI Match
                </Button>
              </Link>
            </div>
          </section>

          <CollectionSection
            title="Favorites"
            perfumeIds={favorites}
            previewLimit={5}
            href="/favorites"
            empty="Favorite fragrances from the library to build your personal shortlist."
          />

          <CollectionSection
            title="Wardrobe"
            perfumeIds={wardrobe}
            previewLimit={5}
            href="/wardrobe"
            empty="Your wardrobe is ready for scents you already own or want to track."
          />
        </Container>
      </div>
    </ProtectedRoute>
  );
}
