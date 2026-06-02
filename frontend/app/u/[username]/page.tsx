"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Container } from '@/components/shared/Container';
import { loadPublicFavoriteIds, loadPublicProfile } from '@/lib/api/profile';
import { loadUserReviews } from '@/lib/api/reviews';
import { getPerfumeById } from '@/lib/api/perfumes';
import { Perfume, ProfileRecord, Review } from '@/lib/types';
import { ReviewStars } from '@/components/review/ReviewStars';
import { PerfumeCard } from '@/components/perfume/PerfumeCard';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [favoritePerfumes, setFavoritePerfumes] = useState<Perfume[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      setIsLoading(true);
      const publicProfile = await loadPublicProfile(username);
      if (!active) return;

      if (!publicProfile) {
        setProfile(null);
        setFavoritePerfumes([]);
        setReviews([]);
        setIsLoading(false);
        return;
      }

      setProfile(publicProfile);

      const [favoriteIds, publicReviews] = await Promise.all([
        publicProfile.show_favorites ? loadPublicFavoriteIds(publicProfile.id) : Promise.resolve([]),
        publicProfile.show_reviews ? loadUserReviews(publicProfile.id) : Promise.resolve([]),
      ]);

      const perfumes = (
        await Promise.all(favoriteIds.slice(0, 12).map(getPerfumeById))
      ).filter(Boolean) as Perfume[];

      if (!active) return;
      setFavoritePerfumes(perfumes);
      setReviews(publicReviews);
      setIsLoading(false);
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, [username]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parfang-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-parfang-accent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Container className="py-24 text-center">
        <h1 className="font-display text-4xl text-parfang-text">Profile not available</h1>
        <p className="mx-auto mt-4 max-w-lg font-body text-sm leading-relaxed text-parfang-muted">
          This profile is private or does not exist.
        </p>
        <div className="mt-6">
          <Link href="/explore" className="font-nav text-xs uppercase tracking-widest text-parfang-accent">
            Back to explore
          </Link>
        </div>
      </Container>
    );
  }

  const displayName = profile.display_name || profile.username || 'Fragrance Seeker';

  return (
    <div className="min-h-screen bg-parfang-bg py-14">
      <Container>
        <div className="rounded-3xl border border-parfang-border bg-parfang-surface p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-parfang-border bg-parfang-bg text-xl font-nav uppercase tracking-widest text-parfang-muted">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={displayName} fill className="object-cover" />
                ) : (
                  displayName.slice(0, 1)
                )}
              </div>
              <div>
                <p className="font-handwrite text-3xl text-parfang-accent">Public scent archive</p>
                <h1 className="mt-2 font-display text-5xl text-parfang-text">{displayName}</h1>
                <p className="mt-2 font-body text-sm text-parfang-muted">@{profile.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:min-w-[240px]">
              <div className="rounded-2xl border border-parfang-border bg-parfang-bg px-4 py-3">
                <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Favorites</p>
                <p className="mt-1 font-display text-2xl text-parfang-text">{profile.show_favorites ? favoritePerfumes.length : 0}</p>
              </div>
              <div className="rounded-2xl border border-parfang-border bg-parfang-bg px-4 py-3">
                <p className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Reviews</p>
                <p className="mt-1 font-display text-2xl text-parfang-text">{profile.show_reviews ? reviews.length : 0}</p>
              </div>
            </div>
          </div>

          <p className="mt-6 max-w-2xl font-body text-sm leading-relaxed text-parfang-muted">
            {profile.bio || 'This collector has chosen to keep their profile simple for now.'}
          </p>
        </div>

        {profile.show_favorites && (
          <section className="border-t border-parfang-border py-12">
            <div className="mb-6 text-left">
              <h2 className="font-display text-3xl text-parfang-text">Public favorites</h2>
              <p className="mt-3 font-body text-sm text-parfang-muted">
                A quick look at the fragrances this profile has chosen to share.
              </p>
            </div>

            {favoritePerfumes.length === 0 ? (
              <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-8 text-center text-parfang-muted">
                No public favorites shared yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {favoritePerfumes.map((perfume) => (
                  <PerfumeCard key={perfume.id} perfume={perfume} showMatchScore={false} />
                ))}
              </div>
            )}
          </section>
        )}

        {profile.show_reviews && (
          <section className="border-t border-parfang-border py-12">
            <div className="mb-6 text-left">
              <h2 className="font-display text-3xl text-parfang-text">Recent reviews</h2>
              <p className="mt-3 font-body text-sm text-parfang-muted">
                Short impressions this profile has chosen to publish.
              </p>
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-8 text-center text-parfang-muted">
                No public reviews shared yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-parfang-border bg-parfang-surface p-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-body text-xs text-parfang-muted">{review.date}</span>
                      <ReviewStars value={review.rating} size={16} />
                    </div>
                    <p className="mt-4 font-body text-sm leading-relaxed text-parfang-text">{review.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </Container>
    </div>
  );
}
