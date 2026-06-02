"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Check, ChevronDown, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Container } from '@/components/shared/Container';
import { PerfumeCard } from '@/components/perfume/PerfumeCard';
import { getPerfumesPage } from '@/lib/api/perfumes';
import { Perfume } from '@/lib/types';
import { ALL_NOTES } from '@/lib/constants';

type SortOption = 'rating' | 'reviews' | 'latest' | 'az';

const PAGE_SIZE = 24;

const ExplorePageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramSearch = searchParams.get('search') || '';
  const paramBrand = searchParams.get('brand') || '';
  const paramNote = searchParams.get('note') || 'All';
  const paramGender = searchParams.get('gender') || 'All';
  const paramSort = (searchParams.get('sort') as SortOption) || 'reviews';
  const paramPage = Math.max(1, Number(searchParams.get('page') || '1') || 1);

  const [search, setSearch] = useState(paramSearch);
  const [brand, setBrand] = useState(paramBrand);
  const [note, setNote] = useState(paramNote);
  const [gender, setGender] = useState(paramGender);
  const [page, setPage] = useState(paramPage);
  const [sortBy, setSortBy] = useState<SortOption>(paramSort);
  const [showNotePicker, setShowNotePicker] = useState(false);

  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [totalPerfumes, setTotalPerfumes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setSearch(paramSearch);
    setBrand(paramBrand);
    setNote(paramNote);
    setGender(paramGender);
    setPage(paramPage);
    setSortBy(paramSort);
  }, [paramSearch, paramBrand, paramNote, paramGender, paramPage, paramSort]);

  useEffect(() => {
    let active = true;

    const fetchPerfumes = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getPerfumesPage({
          search,
          brand,
          note,
          gender,
          sortBy,
          page,
          pageSize: PAGE_SIZE,
        });

        if (!active) return;
        setPerfumes(data.items);
        setTotalPerfumes(data.total);
        setIsLoading(false);
      } catch {
        if (!active) return;
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchPerfumes();
    return () => {
      active = false;
    };
  }, [search, brand, note, gender, sortBy, page]);

  const updateUrlParams = (newFilters: {
    search?: string;
    brand?: string;
    note?: string;
    gender?: string;
    sort?: SortOption;
    page?: number;
  }) => {
    const params = new URLSearchParams();

    const searchVal = newFilters.search !== undefined ? newFilters.search : search;
    const brandVal = newFilters.brand !== undefined ? newFilters.brand : brand;
    const noteVal = newFilters.note !== undefined ? newFilters.note : note;
    const genderVal = newFilters.gender !== undefined ? newFilters.gender : gender;
    const sortVal = newFilters.sort !== undefined ? newFilters.sort : sortBy;
    const pageVal = newFilters.page !== undefined ? newFilters.page : page;

    if (searchVal) params.set('search', searchVal);
    if (brandVal) params.set('brand', brandVal);
    if (noteVal && noteVal !== 'All') params.set('note', noteVal);
    if (genderVal && genderVal !== 'All') params.set('gender', genderVal);
    if (sortVal !== 'reviews') params.set('sort', sortVal);
    if (pageVal > 1) params.set('page', String(pageVal));

    const query = params.toString();
    router.replace(query ? `/explore?${query}` : '/explore', { scroll: false });
  };

  const handleResetFilters = () => {
    setSearch('');
    setBrand('');
    setNote('All');
    setGender('All');
    setPage(1);
    setSortBy('reviews');
    setShowNotePicker(false);
    router.replace('/explore', { scroll: false });
  };

  const activeFilterChips = useMemo(
    () =>
      [
        search ? { key: 'search', label: `Search: ${search}` } : null,
        brand ? { key: 'brand', label: `Brand: ${brand}` } : null,
        note !== 'All' ? { key: 'note', label: `Note: ${note}` } : null,
        gender !== 'All' ? { key: 'gender', label: `Gender: ${gender === 'female' ? 'female' : gender === 'male' ? 'male' : gender}` } : null,
      ].filter(Boolean) as { key: string; label: string }[],
    [brand, gender, note, search]
  );

  const clearChip = (key: string) => {
    if (key === 'search') {
      setSearch('');
      updateUrlParams({ search: '', page: 1 });
      return;
    }
    if (key === 'brand') {
      setBrand('');
      updateUrlParams({ brand: '', page: 1 });
      return;
    }
    if (key === 'note') {
      setNote('All');
      updateUrlParams({ note: 'All', page: 1 });
      return;
    }
    if (key === 'gender') {
      setGender('All');
      updateUrlParams({ gender: 'All', page: 1 });
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalPerfumes / PAGE_SIZE));
  const rangeStart = totalPerfumes === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = totalPerfumes === 0 ? 0 : Math.min(page * PAGE_SIZE, totalPerfumes);

  return (
    <div className="min-h-screen bg-parfang-bg pb-24">
      <div className="relative mb-10 flex h-48 items-center overflow-hidden border-b border-parfang-border/50 bg-parfang-surface md:h-64">
        <Image
          src="/assets/explore-header.webp"
          alt="Luxury fragrance catalog"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-parfang-surface via-parfang-surface/40 to-transparent" />
        <Container className="relative z-10 text-left">
          <span className="mb-2 block font-label-caps text-xs font-semibold uppercase tracking-widest text-primary">
            Library
          </span>
          <h1 className="font-display text-3xl font-bold text-parfang-text md:text-5xl">Fragrance Curation</h1>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <aside className="overflow-visible rounded-2xl border border-parfang-border bg-parfang-surface p-6 text-left shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between border-b border-parfang-border pb-4">
              <span className="flex items-center gap-1.5 font-nav text-xs font-bold uppercase tracking-widest text-parfang-text">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </span>
              <button
                onClick={handleResetFilters}
                className="font-nav text-[10px] uppercase tracking-wider text-parfang-accent transition-colors hover:text-parfang-accent-dark hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-nav text-[10px] font-bold uppercase tracking-wider text-parfang-text">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Brand, scent, notes..."
                    value={search}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSearch(value);
                      updateUrlParams({ search: value, page: 1 });
                    }}
                    className="w-full rounded-lg border border-parfang-border/80 bg-parfang-bg py-2 pl-9 pr-4 text-xs text-parfang-text focus:border-parfang-accent focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-parfang-muted" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-nav text-[10px] font-bold uppercase tracking-wider text-parfang-text">
                  Brand
                </label>
                <input
                  type="text"
                  placeholder="Dior, Lattafa, Creed..."
                  value={brand}
                  onChange={(event) => {
                    const value = event.target.value;
                    setBrand(value);
                    updateUrlParams({ brand: value, page: 1 });
                  }}
                  className="w-full rounded-lg border border-parfang-border/80 bg-parfang-bg px-4 py-2 text-xs text-parfang-text focus:border-parfang-accent focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-nav text-[10px] font-bold uppercase tracking-wider text-parfang-text">
                  Scent Gender
                </label>
                <div className="flex flex-col gap-1.5">
                  {['All', 'unisex', 'female', 'male'].map((gen) => (
                    <label
                      key={gen}
                      className="flex cursor-pointer items-center gap-2 text-xs text-parfang-text transition-colors hover:text-parfang-accent"
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === gen}
                        onChange={() => {
                          setGender(gen);
                          updateUrlParams({ gender: gen, page: 1 });
                        }}
                        className="h-3.5 w-3.5 accent-parfang-accent"
                      />
                      <span className="capitalize">{gen === 'All' ? 'Any Gender' : gen}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="relative flex flex-col gap-2">
                <label className="font-nav text-[10px] font-bold uppercase tracking-wider text-parfang-text">
                  Note / Accord Ingredient
                </label>
                <button
                  type="button"
                  aria-expanded={showNotePicker}
                  onClick={() => setShowNotePicker((current) => !current)}
                  className="flex w-full items-center justify-between rounded-lg border border-parfang-border bg-parfang-bg px-3 py-2 text-left text-xs text-parfang-text"
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
                          updateUrlParams({ note: 'All', page: 1 });
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-parfang-text hover:bg-parfang-bg"
                      >
                        <span>All Notes</span>
                        {note === 'All' && <Check className="h-4 w-4 text-parfang-accent" />}
                      </button>
                      {ALL_NOTES.map((entry) => (
                        <button
                          key={entry}
                          type="button"
                          onClick={() => {
                            setNote(entry);
                            setShowNotePicker(false);
                            updateUrlParams({ note: entry, page: 1 });
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-parfang-text hover:bg-parfang-bg"
                        >
                          <span>{entry}</span>
                          {note === entry && <Check className="h-4 w-4 text-parfang-accent" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-6 lg:col-span-9">
            <div className="flex flex-col gap-4 border-b border-parfang-border/50 pb-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <span className="font-body text-xs text-parfang-muted">
                  Showing {rangeStart}-{rangeEnd} of {totalPerfumes.toLocaleString()} Fragrances
                </span>
                {activeFilterChips.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeFilterChips.map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => clearChip(chip.key)}
                        className="inline-flex items-center gap-1 rounded-full border border-parfang-border bg-parfang-surface px-3 py-1 text-[10px] uppercase tracking-widest text-parfang-text transition hover:border-parfang-accent hover:text-parfang-accent"
                      >
                        <span>{chip.label}</span>
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-parfang-muted">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    const value = event.target.value as SortOption;
                    setSortBy(value);
                    updateUrlParams({ sort: value, page: 1 });
                  }}
                  className="rounded-full border border-parfang-border bg-parfang-surface px-3 py-2 text-xs text-parfang-text outline-none transition focus:border-parfang-accent"
                >
                  <option value="reviews">Most Reviewed</option>
                  <option value="rating">Highest Rated</option>
                  <option value="latest">Newest Release</option>
                  <option value="az">Name A-Z</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-[400px] animate-pulse rounded-2xl border border-parfang-border bg-parfang-surface" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <p className="font-headline-sm text-lg text-red-500">Failed to load perfumes.</p>
                <button
                  onClick={() => router.refresh()}
                  className="flex items-center gap-2 rounded-full bg-parfang-accent px-6 py-2 text-xs font-nav uppercase tracking-wider text-white hover:bg-parfang-accent-dark"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Try Again
                </button>
              </div>
            ) : perfumes.length === 0 ? (
              <div className="flex flex-col items-center gap-6 rounded-2xl border border-parfang-border bg-parfang-surface p-10 py-16 text-center">
                <div className="relative h-48 w-48 opacity-80">
                  <Image
                    src="/assets/empty-no-results.webp"
                    alt="No fragrances match search criteria"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="mb-2 font-headline-sm text-lg font-bold text-parfang-text">No Fragrances Found</h3>
                  <p className="mx-auto max-w-sm font-body text-xs leading-normal text-parfang-muted">
                    We could not find any scents matching your current filter setup. Try a broader brand name, clear the selected note, or switch sorting to discovery mode.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="rounded-full bg-parfang-accent px-6 py-2.5 text-xs font-nav uppercase tracking-wider text-white transition-all hover:bg-parfang-accent-dark"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {perfumes.map((perfume) => (
                  <div key={perfume.id} className="h-full">
                    <PerfumeCard perfume={perfume} showMatchScore={false} />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && totalPerfumes > 0 && (
              <div className="flex items-center justify-between border-t border-parfang-border/50 pt-6">
                <button
                  type="button"
                  onClick={() => updateUrlParams({ page: Math.max(1, page - 1) })}
                  disabled={page <= 1}
                  className="rounded-full border border-parfang-border px-5 py-2 text-xs font-nav uppercase tracking-wider text-parfang-text transition hover:border-parfang-accent hover:text-parfang-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-body text-xs text-parfang-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => updateUrlParams({ page: Math.min(totalPages, page + 1) })}
                  disabled={page >= totalPages}
                  className="rounded-full border border-parfang-border px-5 py-2 text-xs font-nav uppercase tracking-wider text-parfang-text transition hover:border-parfang-accent hover:text-parfang-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-parfang-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-parfang-accent" />
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}
