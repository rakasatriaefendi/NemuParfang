import { fetchApi } from './client';
import { MOCK_PERFUMES } from '../mock-data';
import { CatalogPerfume, CatalogResponse, Perfume, SupabasePerfumeRow } from '../types';
import { hasSupabasePublicConfig, supabaseRest } from '../supabase';
import { ENV } from '../env';

const fallbackImages = [
  '/assets/perfume-placeholder.webp',
  '/assets/fragrance-notes-visual.webp',
  '/assets/occasion-casual.webp',
  '/assets/occasion-date-night.webp',
  '/assets/weather-cool-night.webp',
];

const genderMap = (gender: string): Perfume['gender'] => {
  if (gender === 'women') return 'women';
  if (gender === 'men') return 'men';
  return 'unisex';
};

export const mapCatalogPerfume = (item: CatalogPerfume): Perfume => ({
  id: String(item.id),
  name: item.name,
  brand: item.brand,
  gender: genderMap(item.gender),
  country: item.country || undefined,
  year: item.year,
  perfumers: item.perfumers,
  occasions: [],
  seasons: [],
  notes: { top: item.notes_top, middle: item.notes_middle, base: item.notes_base },
  accords: item.accords.map((name, index) => ({ name, percentage: Math.max(25, 90 - index * 14) })),
  longevity: 0,
  sillage: 'moderate',
  description: `${item.name} by ${item.brand}. Explore its accord profile and olfactory pyramid to understand how the scent develops on skin.`,
  imageUrl: fallbackImages[item.id % fallbackImages.length],
  rating: item.rating,
  reviewCount: item.review_count,
});

const mapSupabasePerfume = (item: SupabasePerfumeRow): Perfume => {
  const sortedAccords = [...(item.perfume_accords || [])]
    .sort((left, right) => left.position - right.position)
    .map((row) => row.accords?.name)
    .filter((value): value is string => Boolean(value));

  const groupedNotes = { top: [] as string[], middle: [] as string[], base: [] as string[] };
  [...(item.perfume_notes || [])]
    .sort((left, right) => left.position - right.position)
    .forEach((row) => {
      const name = row.notes?.name;
      if (name) groupedNotes[row.note_type].push(name);
    });

  return {
    id: String(item.id),
    name: item.name,
    brand: item.brand,
    gender: genderMap(item.gender),
    country: item.country || undefined,
    year: item.release_year || undefined,
    perfumers: [item.perfumer_1, item.perfumer_2].filter((value): value is string => Boolean(value)),
    occasions: [],
    seasons: [],
    notes: groupedNotes,
    accords: sortedAccords.map((name, index) => ({ name, percentage: Math.max(25, 90 - index * 14) })),
    longevity: 0,
    sillage: 'moderate',
    description:
      item.description ||
      `${item.name} by ${item.brand}. Explore its accord profile and olfactory pyramid to understand how the scent develops on skin.`,
    imageUrl: item.image_url || fallbackImages[item.id % fallbackImages.length],
    imageUrlSecondary: item.image_url_secondary || item.image_url || fallbackImages[item.id % fallbackImages.length],
    rating: item.rating,
    reviewCount: item.review_count,
  };
};

const supabaseSelect =
  'id,name,brand,country,gender,rating,review_count,release_year,description,image_url,image_url_secondary,perfumer_1,perfumer_2,' +
  'perfume_accords(position,accords(name)),' +
  'perfume_notes(position,note_type,notes(name))';

export interface PerfumePageResult {
  items: Perfume[];
  total: number;
  page: number;
  pageSize: number;
}

interface PerfumeFilters {
  note?: string;
  gender?: string;
  search?: string;
  brand?: string;
  sortBy?: 'rating' | 'reviews' | 'latest' | 'az';
}

type NamedRow = {
  name: string;
};

const filterByNote = (perfumes: Perfume[], note?: string) => {
  if (!note || note === 'All') return perfumes;
  const needle = note.toLowerCase();
  return perfumes.filter((perfume) =>
    perfume.accords.some((accord) => accord.name.toLowerCase().includes(needle)) ||
    perfume.notes.top.concat(perfume.notes.middle, perfume.notes.base).some((perfumeNote) => perfumeNote.toLowerCase().includes(needle))
  );
};

export async function getPerfumesPage(
  filters?: PerfumeFilters & {
    page?: number;
    pageSize?: number;
  }
): Promise<PerfumePageResult> {
  const page = Math.max(1, filters?.page || 1);
  const pageSize = Math.max(1, filters?.pageSize || 24);
  const sortBy = filters?.sortBy || 'reviews';

  const sortOrder =
    sortBy === 'rating'
      ? 'rating.desc'
      : sortBy === 'latest'
        ? 'release_year.desc.nullslast'
        : sortBy === 'az'
          ? 'name.asc'
          : 'review_count.desc';

  if (hasSupabasePublicConfig()) {
    const params = new URLSearchParams({
      select: supabaseSelect,
      order: sortOrder,
    });
    if (filters?.search) {
      params.set('or', `(name.ilike.*${filters.search}*,brand.ilike.*${filters.search}*)`);
    }
    if (filters?.brand) {
      params.set('brand', `ilike.*${filters.brand}*`);
    }
    if (filters?.gender && filters.gender !== 'All') {
      const gender = filters.gender === 'female' ? 'women' : filters.gender === 'male' ? 'men' : filters.gender;
      params.set('gender', `eq.${gender}`);
    }
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const response = await fetch(`${ENV.SUPABASE_URL}/rest/v1/perfumes?${params.toString()}`, {
        headers: {
          apikey: ENV.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${ENV.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'count=exact',
          Range: `${from}-${to}`,
          'Range-Unit': 'items',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Supabase REST error ${response.status}: ${response.statusText}`);
      }

      const rows = (await response.json()) as SupabasePerfumeRow[];
      const perfumes = filterByNote(rows.map(mapSupabasePerfume), filters?.note);
      const contentRange = response.headers.get('content-range') || '';
      const totalToken = contentRange.split('/')[1];
      const total = totalToken && totalToken !== '*' ? Number(totalToken) : perfumes.length;

      return {
        items: perfumes,
        total,
        page,
        pageSize,
      };
    } catch {
      // Fall through to existing API / mock fallback below.
    }
  }

  const params = new URLSearchParams({ page_size: String(pageSize), page: String(page) });
  if (filters?.search) params.set('search', filters.search);
  if (filters?.note && filters.note !== 'All') params.set('accord', filters.note);
  if (filters?.brand) params.set('brand', filters.brand);
  if (filters?.sortBy) params.set('sort', filters.sortBy);
  if (filters?.gender && filters.gender !== 'All') {
    params.set('gender', filters.gender === 'female' ? 'women' : filters.gender === 'male' ? 'men' : filters.gender);
  }
  try {
    const response = await fetchApi<CatalogResponse>(`/perfumes?${params}`);
    return {
      items: response.items.map(mapCatalogPerfume),
      total: response.total,
      page: response.page,
      pageSize: response.page_size,
    };
  } catch {
    let filtered = filterByNote(MOCK_PERFUMES, filters?.note);
    if (filters?.search) {
      const needle = filters.search.toLowerCase();
      filtered = filtered.filter((perfume) =>
        perfume.name.toLowerCase().includes(needle) || perfume.brand.toLowerCase().includes(needle)
      );
    }
    if (filters?.brand) {
      const needle = filters.brand.toLowerCase();
      filtered = filtered.filter((perfume) => perfume.brand.toLowerCase().includes(needle));
    }
    if (filters?.gender && filters.gender !== 'All') {
      const gender = filters.gender === 'female' ? 'women' : filters.gender === 'male' ? 'men' : filters.gender;
      filtered = filtered.filter((perfume) => perfume.gender === gender);
    }
    filtered = [...filtered].sort((left, right) => {
      if (sortBy === 'rating') return right.rating - left.rating || right.reviewCount - left.reviewCount;
      if (sortBy === 'latest') return (right.year || 0) - (left.year || 0);
      if (sortBy === 'az') return left.name.localeCompare(right.name);
      return right.reviewCount - left.reviewCount;
    });
    const from = (page - 1) * pageSize;
    const items = filtered.slice(from, from + pageSize);
    return {
      items,
      total: filtered.length,
      page,
      pageSize,
    };
  }
}

export async function getPerfumes(filters?: PerfumeFilters): Promise<Perfume[]> {
  const result = await getPerfumesPage(filters);
  return result.items;
}

export async function getPerfumeById(id: string): Promise<Perfume | null> {
  if (hasSupabasePublicConfig()) {
    try {
      const rows = await supabaseRest<SupabasePerfumeRow[]>(`perfumes?select=${encodeURIComponent(supabaseSelect)}&id=eq.${id}&limit=1`);
      return rows[0] ? mapSupabasePerfume(rows[0]) : null;
    } catch {
      // Fall through to existing API / mock fallback below.
    }
  }

  try {
    return mapCatalogPerfume(await fetchApi<CatalogPerfume>(`/perfumes/${id}`));
  } catch {
    return MOCK_PERFUMES.find((item) => item.id === id) || null;
  }
}

export async function getFeaturedPerfumes(): Promise<Perfume[]> {
  const perfumes = await getPerfumes();
  return perfumes.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3);
}

export async function getQuizNoteOptions(): Promise<string[]> {
  const fallback = [
    'amber',
    'aromatic',
    'citrus',
    'floral',
    'fresh',
    'gourmand',
    'green',
    'marine',
    'musky',
    'oud',
    'powdery',
    'sweet',
    'warm spicy',
    'woody',
  ];

  if (!hasSupabasePublicConfig()) {
    return fallback.sort((left, right) => left.localeCompare(right));
  }

  try {
    const [notesRows, accordRows] = await Promise.all([
      supabaseRest<NamedRow[]>('notes?select=name&order=name.asc'),
      supabaseRest<NamedRow[]>('accords?select=name&order=name.asc'),
    ]);

    const merged = Array.from(
      new Map(
        notesRows
          .concat(accordRows)
          .map((row) => row.name?.trim())
          .filter((value): value is string => Boolean(value))
          .map((name) => [name.toLowerCase(), name]),
      ).values(),
    );

    return merged.sort((left, right) => left.localeCompare(right));
  } catch {
    return fallback.sort((left, right) => left.localeCompare(right));
  }
}
