import { fetchApi } from './client';
import { getPerfumeById, mapCatalogPerfume } from './perfumes';
import { CatalogPerfume, MlMatchRequest, MlMatchResponse, Perfume } from '../types';

const toPercentage = (score: number) => Math.round(Math.max(72, Math.min(98, 72 + score * 8)));

export async function getAiMatch(input: MlMatchRequest): Promise<{
  perfumes: Perfume[];
  fragranceDNA: { name: string; percentage: number }[];
}> {
  const result = await fetchApi<MlMatchResponse>('/match', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  const perfumes = result.recommendations.map((item) => ({
    id: String(item.id),
    name: item.name,
    brand: item.brand,
    gender: item.gender === 'women' ? 'women' as const : item.gender === 'men' ? 'men' as const : 'unisex' as const,
    occasions: [],
    seasons: [],
    notes: { top: [], middle: [], base: [] },
    accords: item.accords.split(',').filter(Boolean).map((name, index) => ({ name: name.trim(), percentage: Math.max(25, 90 - index * 14) })),
    longevity: 0,
    sillage: 'moderate' as const,
    description: `A curated match for your ${input.style} profile with ${input.preferred_accords.join(', ')} accords.`,
    imageUrl: '/assets/perfume-placeholder.webp',
    rating: item.rating,
    reviewCount: item.review_count,
    matchScore: toPercentage(item.match_score),
    recommendationReason: `Selected for its ${item.accords.split(',').slice(0, 3).join(', ')} accord alignment and ${item.gender} profile.`,
  }));
  const counts = new Map<string, number>();
  perfumes.forEach((perfume) => perfume.accords.slice(0, 5).forEach((accord) => counts.set(accord.name, (counts.get(accord.name) || 0) + accord.percentage)));
  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0) || 1;
  const fragranceDNA = Array.from(counts.entries()).map(([name, value]) => ({ name, percentage: Math.round(value / total * 100) })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);
  return { perfumes, fragranceDNA };
}

export async function getSimilarPerfumes(id: string): Promise<Perfume[]> {
  try {
    return (await fetchApi<CatalogPerfume[]>(`/perfumes/${id}/similar?top_k=4`)).map(mapCatalogPerfume);
  } catch {
    const perfume = await getPerfumeById(id);
    return perfume ? [perfume] : [];
  }
}
