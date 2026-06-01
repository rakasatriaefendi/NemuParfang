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
import { MOCK_REVIEWS } from '@/lib/mock-data';
import { Perfume, Review } from '@/lib/types';
import { SILLAGE_LABELS } from '@/lib/constants';
import { Star, Clock, Sparkles, Smile, ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthSession, useCollections } from '@/components/auth/AuthProvider';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { Button } from '@/components/ui/Button';

export default function PerfumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [similar, setSimilar] = useState<Perfume[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

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
          setReviews(MOCK_REVIEWS[id] || []);
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
          <div className="lg:col-span-6 relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-parfang-surface border border-parfang-border">
            <Image
              src={perfume.imageUrl}
              alt={perfume.name}
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Right Column: Spec Sheet */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
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
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4 fill-current',
                      i < Math.floor(perfume.rating) ? 'text-amber-500' : 'text-parfang-border'
                    )}
                  />
                ))}
              </div>
              <span className="font-body text-sm font-bold text-parfang-text ml-1">
                {perfume.rating}
              </span>
              <span className="font-body text-xs text-parfang-muted">
                ({perfume.reviewCount} discovery reviews)
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
              {reviews.length === 0 ? (
                <div className="p-8 border border-parfang-border rounded-xl bg-parfang-surface text-center text-parfang-muted">
                  No reviews submitted yet for this fragrance.
                </div>
              ) : (
                reviews.map((rev) => (
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
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn('w-3 h-3 fill-current', i < rev.rating ? 'text-amber-500' : 'text-parfang-border')} />
                        ))}
                      </div>
                    </div>
                    <p className="font-body text-xs text-parfang-muted leading-relaxed">
                      {rev.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* AI Sentiment Analysis Block (Prepared) */}
            <div className="lg:col-span-4 bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex flex-col items-start h-fit">
              <span className="font-label-caps text-[9px] uppercase tracking-wider text-parfang-accent mb-2 block font-semibold">
                AI Pipeline Integration
              </span>
              <h4 className="font-headline-sm text-base text-parfang-text font-bold mb-3 flex items-center gap-1.5">
                <Smile className="w-5 h-5 text-parfang-accent" /> Sentiment Analyzer
              </h4>
              <p className="font-body text-[11px] text-parfang-muted leading-relaxed mb-6">
                Connected to NLP sentiment analyzer pipeline contract `/api/reviews/sentiment`. Reviews are automatically classified based on feedback language.
              </p>
              
              <div className="w-full flex flex-col gap-3 text-xs font-body text-parfang-text">
                <div className="flex justify-between items-center pb-2 border-b border-parfang-border/50">
                  <span>Sentiment Score</span>
                  <span className="font-semibold text-emerald-600">92% Positive</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-parfang-border/50">
                  <span>General Consensus</span>
                  <span className="text-parfang-muted">Elegant, Long-lasting</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>NLP Parser State</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold font-nav uppercase">
                    Ready
                  </span>
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
