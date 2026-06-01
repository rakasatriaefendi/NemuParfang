"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/shared/Container';
import { PerfumeCard } from '@/components/perfume/PerfumeCard';
import { getPerfumes } from '@/lib/api/perfumes';
import { Perfume } from '@/lib/types';
import { ALL_NOTES } from '@/lib/constants';
import { Check, ChevronDown, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

// Wrapper component to handle search params in Suspense
const ExplorePageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load initial filter states from query params
  const paramSearch = searchParams.get('search') || '';
  const paramNote = searchParams.get('note') || 'All';
  const paramGender = searchParams.get('gender') || 'All';

  const [search, setSearch] = useState(paramSearch);
  const [note, setNote] = useState(paramNote);
  const [gender, setGender] = useState(paramGender);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'reviews'
  const [showNotePicker, setShowNotePicker] = useState(false);

  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setSearch(paramSearch);
    setNote(paramNote);
    setGender(paramGender);
  }, [paramSearch, paramNote, paramGender]);

  // Fetch perfumes when filters change
  useEffect(() => {
    let active = true;
    const fetchPerfumes = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getPerfumes({
          search,
          note,
          gender
        });
        if (active) {
          // Client-side sorting
          const sorted = [...data].sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
            return 0;
          });
          setPerfumes(sorted);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          setIsError(true);
          setIsLoading(false);
        }
      }
    };

    fetchPerfumes();
    return () => {
      active = false;
    };
  }, [search, note, gender, sortBy]);

  // Update query params in URL
  const updateUrlParams = (newFilters: {
    search?: string;
    note?: string;
    gender?: string;
  }) => {
    const params = new URLSearchParams();
    
    const searchVal = newFilters.search !== undefined ? newFilters.search : search;
    const noteVal = newFilters.note !== undefined ? newFilters.note : note;
    const genderVal = newFilters.gender !== undefined ? newFilters.gender : gender;

    if (searchVal) params.set('search', searchVal);
    if (noteVal && noteVal !== 'All') params.set('note', noteVal);
    if (genderVal && genderVal !== 'All') params.set('gender', genderVal);

    router.push(`/explore?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setNote('All');
    setGender('All');
    setShowNotePicker(false);
    router.push('/explore');
  };

  return (
    <div className="min-h-screen bg-parfang-bg pb-24">
      {/* 1. Header Banner */}
      <div className="relative h-48 md:h-64 bg-parfang-surface border-b border-parfang-border/50 overflow-hidden flex items-center mb-10">
        <Image
          src="/assets/explore-header.png"
          alt="Luxury fragrance catalog"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-parfang-surface via-parfang-surface/40 to-transparent" />
        <Container className="relative z-10 text-left">
          <span className="font-label-caps text-xs text-primary uppercase tracking-widest font-semibold block mb-2">
            Library
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-parfang-text font-bold">
            Fragrance Curation
          </h1>
        </Container>
      </div>

      {/* 2. Main Exploration Area */}
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Filter Panel */}
          <aside className="lg:col-span-3 bg-parfang-surface p-6 rounded-2xl border border-parfang-border shadow-sm flex flex-col gap-6 text-left overflow-visible">
            <div className="flex justify-between items-center pb-4 border-b border-parfang-border">
              <span className="font-nav text-xs uppercase tracking-widest text-parfang-text font-bold flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </span>
              <button
                onClick={handleResetFilters}
                className="font-nav text-[10px] uppercase tracking-wider text-parfang-accent hover:text-parfang-accent-dark hover:underline transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Scent Search */}
            <div className="flex flex-col gap-2">
              <label className="font-nav text-[10px] uppercase tracking-wider text-parfang-text font-bold">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Brand, Scent, Notes..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    updateUrlParams({ search: e.target.value });
                  }}
                  className="w-full bg-parfang-bg border border-parfang-border/80 px-4 py-2 pl-9 rounded-lg text-xs font-body text-parfang-text focus:outline-none focus:border-parfang-accent"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-parfang-muted" />
              </div>
            </div>

            {/* Gender Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-nav text-[10px] uppercase tracking-wider text-parfang-text font-bold">
                Scent Gender
              </label>
              <div className="flex flex-col gap-1.5">
                {['All', 'unisex', 'female', 'male'].map((gen) => (
                  <label key={gen} className="flex items-center gap-2 text-xs font-body text-parfang-text cursor-pointer hover:text-parfang-accent">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === gen}
                      onChange={() => {
                        setGender(gen);
                        updateUrlParams({ gender: gen });
                      }}
                      className="accent-parfang-accent w-3.5 h-3.5"
                    />
                    <span className="capitalize">{gen === 'All' ? 'Any Gender' : gen}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Note Accords Filter */}
            <div className="relative flex flex-col gap-2">
              <label className="font-nav text-[10px] uppercase tracking-wider text-parfang-text font-bold">
                Note / Accord Ingredient
              </label>
              <button
                type="button"
                aria-expanded={showNotePicker}
                onClick={() => setShowNotePicker((current) => !current)}
                className="flex w-full items-center justify-between rounded-lg border border-parfang-border bg-parfang-bg px-3 py-2 text-left text-xs font-body text-parfang-text"
              >
                <span>{note === 'All' ? 'All Notes' : note}</span>
                <ChevronDown className={showNotePicker ? 'h-4 w-4 rotate-180 transition-transform' : 'h-4 w-4 transition-transform'} />
              </button>

              {showNotePicker && (
                <div className="z-20 overflow-hidden rounded-xl border border-parfang-border bg-parfang-surface shadow-xl">
                  <div className="max-h-64 overflow-y-auto p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNote('All');
                        setShowNotePicker(false);
                        updateUrlParams({ note: 'All' });
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-body text-parfang-text hover:bg-parfang-bg"
                    >
                      <span>All Notes</span>
                      {note === 'All' && <Check className="h-4 w-4 text-parfang-accent" />}
                    </button>
                    {ALL_NOTES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setNote(n);
                          setShowNotePicker(false);
                          updateUrlParams({ note: n });
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-body text-parfang-text hover:bg-parfang-bg"
                      >
                        <span>{n}</span>
                        {note === n && <Check className="h-4 w-4 text-parfang-accent" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Area: Catalog grid */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Catalog Controller (Sorting & Counter) */}
            <div className="flex justify-between items-center pb-3 border-b border-parfang-border/50 text-xs">
              <span className="font-body text-parfang-muted">
                Showing {perfumes.length} Fragrances
              </span>
              <div className="flex items-center gap-2">
                <span className="font-body text-parfang-muted">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-body text-parfang-text focus:outline-none cursor-pointer text-xs"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </div>
            </div>

            {/* Scent Grid */}
            {isLoading ? (
              // Loading Skeleton State
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-parfang-surface border border-parfang-border h-[400px]" />
                ))}
              </div>
            ) : isError ? (
              // Error State
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <p className="font-headline-sm text-lg text-red-500">Failed to load perfumes.</p>
                <button
                  onClick={() => router.refresh()}
                  className="flex items-center gap-2 bg-parfang-accent text-white px-6 py-2 rounded-full text-xs font-nav uppercase tracking-wider hover:bg-parfang-accent-dark"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
              </div>
            ) : perfumes.length === 0 ? (
              // Empty State
              <div className="py-16 bg-parfang-surface border border-parfang-border rounded-2xl p-10 text-center flex flex-col items-center gap-6">
                <div className="relative w-48 h-48 opacity-80">
                  <Image
                    src="/assets/empty-no-results.png"
                    alt="No fragrances match search criteria"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg text-parfang-text mb-2 font-bold">
                    No Fragrances Found
                  </h3>
                  <p className="font-body text-xs text-parfang-muted max-w-sm mx-auto leading-normal">
                    We couldn't find any scents matching your filter configurations. Try clearing search keywords or note selections.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="bg-parfang-accent text-white px-6 py-2.5 rounded-full text-xs font-nav uppercase tracking-wider hover:bg-parfang-accent-dark transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              // Perfumes catalog list
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {perfumes.map((perfume) => (
                  <div key={perfume.id} className="h-full">
                    <PerfumeCard perfume={perfume} showMatchScore={false} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parfang-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-parfang-accent" />
      </div>
    }>
      <ExplorePageContent />
    </Suspense>
  );
}
