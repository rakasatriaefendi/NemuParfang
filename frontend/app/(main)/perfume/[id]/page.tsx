"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/shared/Container';
import { NotesPyramid } from '@/components/perfume/NotesPyramid';
import { AccordBar } from '@/components/perfume/AccordBar';
import { PerfumeCard } from '@/components/perfume/PerfumeCard';
import { getPerfumeById } from '@/lib/api/perfumes';
import { getSimilarPerfumes } from '@/lib/api/recommendations';
import { loadReviews, persistReview, removeReview } from '@/lib/api/reviews';
import { Perfume, Review } from '@/lib/types';
import { Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthSession, useCollections } from '@/components/auth/AuthProvider';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { Button } from '@/components/ui/Button';
import { ReviewStars } from '@/components/review/ReviewStars';

export default function PerfumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [similar, setSimilar] = useState<Perfume[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviewDraft, setReviewDraft] = useState({ rating: 0, content: '' });
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { session } = useAuthSession();
  const { wardrobe, toggleWardrobe } = useCollections();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const p = await getPerfumeById(id);
        if (p) {
          setPerfume(p);
          const sim = await getSimilarPerfumes(id);
          setSimilar(sim);
        } else {
          setPerfume(null);
        }
        setIsLoading(false);
      } catch (err) {
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    let active = true;

    const fetchReviews = async () => {
      try {
        const nextReviews = await loadReviews(id, session?.user.id);
        if (active) {
          setReviews(nextReviews);
        }
      } catch {
        if (active) {
          setReviews([]);
        }
      }
    };

    fetchReviews();
    return () => {
      active = false;
    };
  }, [id, session?.user.id]);

  const currentUserReview = session ? reviews.find((review) => review.userId === session.user.id) || null : null;
  const communityReviews = session
    ? reviews.filter((review) => review.userId !== session.user.id)
    : reviews;
  const internalAverageRating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : null;

  useEffect(() => {
    if (!session) {
      setReviewDraft({ rating: 0, content: '' });
      return;
    }

    if (currentUserReview) {
      setReviewDraft({
        rating: currentUserReview.rating,
        content: currentUserReview.content,
      });
      setIsEditingReview(false);
      return;
    }

    setReviewDraft({ rating: 0, content: '' });
  }, [currentUserReview?.id, session]);

  const refreshReviews = async () => {
    const nextReviews = await loadReviews(id, session?.user.id);
    setReviews(nextReviews);
  };

  const handleSubmitReview = async () => {
    if (!session) {
      router.push(`/login?redirect=/perfume/${id}`);
      return;
    }

    if (reviewDraft.rating < 1 || reviewDraft.rating > 5) {
      setReviewError('Choose a rating from 1 to 5 stars.');
      return;
    }

    if (reviewDraft.content.trim().length < 3) {
      setReviewError('Write at least a short impression before submitting.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');
    try {
      await persistReview(session, id, {
        reviewId: currentUserReview?.id,
        rating: reviewDraft.rating,
        content: reviewDraft.content,
      });
      await refreshReviews();
      setIsEditingReview(false);
      if (!currentUserReview) {
        setReviewDraft({ rating: 0, content: '' });
      }
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Failed to save your review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!session || !currentUserReview) return;

    setIsSubmittingReview(true);
    setReviewError('');
    try {
      await removeReview(session, currentUserReview.id);
      await refreshReviews();
      setReviewDraft({ rating: 0, content: '' });
      setIsEditingReview(false);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Failed to delete your review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parfang-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parfang-accent" />
      </div>
    );
  }

  if (isError || !perfume) {
    return (
      <Container className="py-24 text-center">
        <h2 className="font-headline-sm text-2xl text-parfang-text mb-4">Fragrance Profile Not Found</h2>
        <p className="font-body text-sm text-parfang-muted mb-8">
          The perfume catalog ID you requested doesn't exist or is currently unavailable.
        </p>
        <button
          onClick={() => router.push('/explore')}
          className="bg-parfang-accent text-white px-6 py-2.5 rounded-full text-xs font-nav uppercase tracking-wider hover:bg-parfang-accent-dark transition-all"
        >
          Return to Explore
        </button>
      </Container>
    );
  }

  const wardrobeActive = wardrobe.includes(perfume.id);
  const displayRating = internalAverageRating ?? perfume.rating;
  const displayReviewCount = reviews.length || perfume.reviewCount;

  return (
    <div className="min-h-screen bg-parfang-bg pb-24">
      {/* Back button */}
      <Container className="pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-nav uppercase tracking-wider text-parfang-muted hover:text-parfang-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to discovery
        </button>
      </Container>

      {/* Main Fragrance Overview */}
      <Container className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Left Column: Image Area */}
          <div className="lg:col-span-5 relative h-[340px] sm:h-[420px] lg:h-[500px] xl:h-[520px] rounded-2xl overflow-hidden shadow-sm bg-parfang-surface border border-parfang-border">
            <Image
              src={perfume.imageUrl}
              alt={perfume.name}
              fill
              priority
              className="object-contain object-center p-4 sm:p-6"
            />
          </div>

          {/* Right Column: Spec Sheet */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="font-nav text-xs uppercase tracking-widest text-parfang-muted mb-2 font-medium">
              {perfume.brand}
            </span>
            <h1 className="font-display text-3xl md:text-5xl text-parfang-text mb-2 font-bold leading-tight">
              {perfume.name}
            </h1>
            <p className="font-nav text-xs uppercase tracking-wider text-parfang-accent mb-6 font-semibold">
              {[perfume.gender, perfume.country, perfume.year].filter(Boolean).join(' · ')}
            </p>

            {/* Star Rating details */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-parfang-border w-full">
              <ReviewStars value={Math.round(displayRating)} />
              <span className="font-body text-sm font-bold text-parfang-text ml-1">
                {displayRating.toFixed(1)}
              </span>
              <span className="font-body text-xs text-parfang-muted">
                ({displayReviewCount} {reviews.length ? 'community reviews' : 'discovery reviews'})
              </span>
            </div>

            {/* Description */}
            <p className="font-body text-sm text-parfang-muted leading-relaxed mb-8">
              {perfume.description}
            </p>
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <FavoriteButton perfumeId={perfume.id} />
              {session ? (
                <Button
                  variant="secondary"
                  onClick={() => toggleWardrobe(perfume.id)}
                  className={cn(
                    wardrobeActive
                      ? 'border-parfang-accent bg-parfang-accent text-white hover:bg-parfang-accent-dark hover:text-white'
                      : 'bg-white text-parfang-accent hover:border-parfang-accent-dark hover:bg-white hover:text-parfang-accent-dark',
                  )}
                >
                  {wardrobeActive ? 'Saved to Wardrobe' : 'Add to Wardrobe'}
                </Button>
              ) : (
                <Link href="/login"><Button variant="secondary">Login to Save</Button></Link>
              )}
            </div>

            {/* Accords Bar layout */}
            <div className="w-full mb-8">
              <h3 className="font-label-caps text-xs uppercase tracking-wider text-parfang-text font-bold mb-4">
                Fragrance Accords
              </h3>
              <AccordBar accords={perfume.accords} />
            </div>

            {/* Sillage & Longevity indicators */}
            {perfume.longevity > 0 && <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-parfang-border">
              {/* Longevity indicator */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-nav uppercase tracking-wider text-parfang-text font-semibold">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-parfang-accent" /> Longevity</span>
                  <span>{perfume.longevity}/10 hrs</span>
                </div>
                <div className="w-full h-1.5 bg-parfang-border/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-parfang-accent rounded-full"
                    style={{ width: `${perfume.longevity * 10}%` }}
                  />
                </div>
              </div>

              {/* Sillage indicator */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-nav uppercase tracking-wider text-parfang-text font-semibold">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-parfang-accent" /> Sillage Trail</span>
                  <span className="capitalize">{perfume.sillage}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {['intimate', 'moderate', 'strong', 'enormous'].map((sil, index) => {
                    const steps = ['intimate', 'moderate', 'strong', 'enormous'];
                    const currentIdx = steps.indexOf(perfume.sillage);
                    return (
                      <div
                        key={sil}
                        className={cn(
                          'h-1.5 rounded-full',
                          index <= currentIdx ? 'bg-parfang-accent' : 'bg-parfang-border/40'
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>}
          </div>
        </div>

        {/* Tab Selectors: Pyramid, Reviews, Sentiment */}
        <div className="border-b border-parfang-border/50 mb-8 flex justify-center md:justify-start gap-8">
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              'font-nav text-xs uppercase tracking-wider pb-3 border-b-2 font-bold transition-all duration-300',
              activeTab === 'details' ? 'border-parfang-accent text-parfang-accent' : 'border-transparent text-parfang-muted hover:text-parfang-text'
            )}
          >
            Scent Pyramid
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              'font-nav text-xs uppercase tracking-wider pb-3 border-b-2 font-bold transition-all duration-300',
              activeTab === 'reviews' ? 'border-parfang-accent text-parfang-accent' : 'border-transparent text-parfang-muted hover:text-parfang-text'
            )}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'details' ? (
          <div className="mb-16">
            <NotesPyramid notes={perfume.notes} />
          </div>
        ) : (
          <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Reviews Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {session && currentUserReview && !isEditingReview && (
                <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-6">
                  <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent font-semibold">
                    Your Review
                  </span>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <ReviewStars value={currentUserReview.rating} size={18} />
                        <span className="font-body text-xs text-parfang-muted">{currentUserReview.date}</span>
                      </div>
                      <p className="mt-4 font-body text-sm leading-relaxed text-parfang-text">
                        {currentUserReview.content}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="secondary" onClick={() => setIsEditingReview(true)}>
                        Edit Review
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleDeleteReview}
                        disabled={isSubmittingReview}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {(!currentUserReview || isEditingReview) && (
                <div className="rounded-2xl border border-parfang-border bg-parfang-surface p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="font-label-caps text-[10px] uppercase tracking-wider text-parfang-accent font-semibold">
                        Community Review
                      </span>
                      <h3 className="mt-2 font-display text-2xl text-parfang-text font-bold">
                        {currentUserReview ? 'Edit your impression' : 'Share your impression'}
                      </h3>
                      <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-parfang-muted">
                        Use a familiar 1 to 5 star rating, then add a short comment about wear, notes, or how the fragrance felt on skin.
                      </p>
                    </div>

                    {session ? (
                      <>
                        <div className="flex flex-col gap-2">
                          <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-text font-bold">
                            Your rating
                          </span>
                          <ReviewStars
                            value={reviewDraft.rating}
                            onChange={(value) => setReviewDraft((current) => ({ ...current, rating: value }))}
                            interactive
                            size={24}
                          />
                          <span className="font-body text-xs text-parfang-muted">
                            {reviewDraft.rating > 0 ? `${reviewDraft.rating} of 5 stars` : 'Tap a star to rate'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="font-nav text-[10px] uppercase tracking-widest text-parfang-text font-bold">
                            Your comment
                          </label>
                          <textarea
                            value={reviewDraft.content}
                            onChange={(event) => setReviewDraft((current) => ({ ...current, content: event.target.value }))}
                            rows={5}
                            maxLength={2000}
                            placeholder="How does it wear, what stands out, and when would you reach for it?"
                            className="min-h-[144px] rounded-xl border border-parfang-border bg-parfang-bg px-4 py-3 text-sm text-parfang-text outline-none transition focus:border-parfang-accent"
                          />
                          <div className="flex items-center justify-between text-xs text-parfang-muted">
                            <span>{currentUserReview ? 'Update your existing review anytime.' : 'One review per fragrance per account.'}</span>
                            <span>{reviewDraft.content.length}/2000</span>
                          </div>
                        </div>

                        {reviewError && (
                          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {reviewError}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
                            {isSubmittingReview ? 'Saving…' : currentUserReview ? 'Update Review' : 'Submit Review'}
                          </Button>
                          {currentUserReview && (
                            <Button variant="secondary" onClick={() => setIsEditingReview(false)}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-parfang-border bg-parfang-bg px-4 py-4">
                        <p className="font-body text-sm leading-relaxed text-parfang-muted">
                          Sign in to leave a rating and comment for this fragrance.
                        </p>
                        <div className="mt-4">
                          <Link href={`/login?redirect=/perfume/${id}`}>
                            <Button>Login to Review</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {communityReviews.length === 0 ? (
                <div className="p-8 border border-parfang-border rounded-xl bg-parfang-surface text-center text-parfang-muted">
                  No community reviews submitted yet for this fragrance.
                </div>
              ) : (
                communityReviews.map((rev) => (
                  <div key={rev.id} className="bg-parfang-surface border border-parfang-border/50 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-parfang-bg text-[10px] font-nav uppercase tracking-widest text-parfang-muted">
                          {rev.userAvatar ? (
                            <Image src={rev.userAvatar} alt={rev.userName} fill className="object-cover" />
                          ) : (
                            rev.userName.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <span className="font-body text-xs font-semibold text-parfang-text block">{rev.userName}</span>
                          <span className="font-body text-[10px] text-parfang-muted block">{rev.date}</span>
                        </div>
                      </div>
                      <ReviewStars value={rev.rating} size={14} />
                    </div>
                    <p className="font-body text-xs text-parfang-muted leading-relaxed">
                      {rev.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Review Summary Block */}
            <div className="lg:col-span-4 rounded-2xl border border-parfang-border bg-parfang-surface p-6 flex flex-col items-start h-fit">
              <span className="font-label-caps text-[9px] uppercase tracking-wider text-parfang-accent mb-2 block font-semibold">
                Review Summary
              </span>
              <h4 className="font-headline-sm text-base text-parfang-text font-bold mb-4">
                Community pulse
              </h4>

              <div className="w-full space-y-4 text-sm">
                <div className="rounded-xl border border-parfang-border/60 bg-parfang-bg px-4 py-4">
                  <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Average rating</span>
                  <div className="mt-2 flex items-center gap-3">
                    <ReviewStars value={Math.round(displayRating)} size={18} />
                    <span className="font-display text-2xl text-parfang-text font-bold">{displayRating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-parfang-border/60 bg-parfang-bg px-4 py-4">
                  <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Community reviews</span>
                  <p className="mt-2 font-display text-2xl text-parfang-text font-bold">{reviews.length}</p>
                </div>

                <div className="rounded-xl border border-parfang-border/60 bg-parfang-bg px-4 py-4">
                  <span className="font-nav text-[10px] uppercase tracking-widest text-parfang-muted">Review style</span>
                  <p className="mt-2 font-body text-sm leading-relaxed text-parfang-muted">
                    Ratings use simple 1 to 5 stars. The average may show a decimal because it is calculated from the community total.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Similar Curation Section */}
        {similar.length > 0 && (
          <div className="pt-16 border-t border-parfang-border/50">
            <div className="text-left mb-10">
              <span className="font-label-caps text-xs text-primary mb-2 block uppercase tracking-widest font-semibold">
                Similar Blends
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-parfang-text font-bold">
                You might also enjoy
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((simPerfume) => (
                <div key={simPerfume.id} className="h-full">
                  <PerfumeCard perfume={simPerfume} showMatchScore={false} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
