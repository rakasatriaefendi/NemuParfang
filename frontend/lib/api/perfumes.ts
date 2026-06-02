import { fetchApi } from './client';
import { MOCK_PERFUMES } from '../mock-data';
import { CatalogPerfume, CatalogResponse, Perfume, SupabasePerfumeRow } from '../types';
import { hasSupabasePublicConfig, supabaseRest } from '../supabase';

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

export async function getPerfumes(filters?: {
  occasion?: string;
  note?: string;
  gender?: string;
  search?: string;
}): Promise<Perfume[]> {
  if (hasSupabasePublicConfig()) {
    const params = new URLSearchParams({
      select: supabaseSelect,
      order: 'review_count.desc',
      limit: '72',
    });
    if (filters?.search) {
      params.set('or', `(name.ilike.*${filters.search}*,brand.ilike.*${filters.search}*)`);
    }
    if (filters?.gender && filters.gender !== 'All') {
      const gender = filters.gender === 'female' ? 'women' : filters.gender === 'male' ? 'men' : filters.gender;
      params.set('gender', `eq.${gender}`);
    }
    try {
      const rows = await supabaseRest<SupabasePerfumeRow[]>(`perfumes?${params.toString()}`);
      const perfumes = rows.map(mapSupabasePerfume);
      if (filters?.note && filters.note !== 'All') {
        const needle = filters.note.toLowerCase();
        return perfumes.filter((perfume) =>
          perfume.accords.some((accord) => accord.name.toLowerCase().includes(needle)) ||
          perfume.notes.top.concat(perfume.notes.middle, perfume.notes.base).some((note) => note.toLowerCase().includes(needle))
        );
      }
      return perfumes;
    } catch {
      // Fall through to existing API / mock fallback below.
    }
  }

  const params = new URLSearchParams({ page_size: '24' });
  if (filters?.search) params.set('search', filters.search);
  if (filters?.note && filters.note !== 'All') params.set('accord', filters.note);
  if (filters?.gender && filters.gender !== 'All') {
    params.set('gender', filters.gender === 'female' ? 'women' : filters.gender === 'male' ? 'men' : filters.gender);
  }
  try {
    const response = await fetchApi<CatalogResponse>(`/perfumes?${params}`);
    return response.items.map(mapCatalogPerfume);
  } catch {
    return MOCK_PERFUMES;
  }
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
