import { fetchApi } from './client';
import { getPerfumeById, getPerfumesPage } from './perfumes';
import { MlMatchRequest, MlMatchResponse, Perfume } from '../types';

const toPercentage = (score: number) => Math.round(Math.max(72, Math.min(98, 72 + score * 8)));

export async function getAiMatch(input: MlMatchRequest): Promise<{
  perfumes: Perfume[];
  fragranceDNA: { name: string; percentage: number }[];
}> {
  const result = await fetchApi<MlMatchResponse>('/match', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  const perfumes = await Promise.all(
    result.recommendations.map(async (item) => {
      const hydrated = await getPerfumeById(String(item.id));
      const accords = item.accords
        .split(',')
        .filter(Boolean)
        .map((name, index) => ({ name: name.trim(), percentage: Math.max(25, 90 - index * 14) }));

      if (hydrated) {
        return {
          ...hydrated,
          rating: item.rating,
          reviewCount: item.review_count,
          matchScore: toPercentage(item.match_score),
          recommendationReason: `Selected for its ${item.accords.split(',').slice(0, 3).join(', ')} accord alignment and ${item.gender} profile.`,
          accords: hydrated.accords.length > 0 ? hydrated.accords : accords,
          description:
            hydrated.description ||
            `A curated match for your ${input.style} profile with ${input.preferred_accords.join(', ')} accords.`,
        } satisfies Perfume;
      }

      return {
        id: String(item.id),
        name: item.name,
        brand: item.brand,
        gender: item.gender === 'women' ? 'women' as const : item.gender === 'men' ? 'men' as const : 'unisex' as const,
        occasions: [],
        seasons: [],
        notes: { top: [], middle: [], base: [] },
        accords,
        longevity: 0,
        sillage: 'moderate' as const,
        description: `A curated match for your ${input.style} profile with ${input.preferred_accords.join(', ')} accords.`,
        imageUrl: '/assets/perfume-placeholder.webp',
        rating: item.rating,
        reviewCount: item.review_count,
        matchScore: toPercentage(item.match_score),
        recommendationReason: `Selected for its ${item.accords.split(',').slice(0, 3).join(', ')} accord alignment and ${item.gender} profile.`,
      } satisfies Perfume;
    })
  );
  const counts = new Map<string, number>();
  perfumes.forEach((perfume) => perfume.accords.slice(0, 5).forEach((accord) => counts.set(accord.name, (counts.get(accord.name) || 0) + accord.percentage)));
  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0) || 1;
  const fragranceDNA = Array.from(counts.entries()).map(([name, value]) => ({ name, percentage: Math.round(value / total * 100) })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);
  return { perfumes, fragranceDNA };
}

export async function getSimilarPerfumes(id: string): Promise<Perfume[]> {
  const target = await getPerfumeById(id);
  if (target) {
    try {
      const genderFilter =
        target.gender === 'women' || target.gender === 'men' ? target.gender : 'All';

      const [popularPage, ratedPage] = await Promise.all([
        getPerfumesPage({ gender: genderFilter, sortBy: 'reviews', page: 1, pageSize: 120 }),
        getPerfumesPage({ gender: genderFilter, sortBy: 'rating', page: 1, pageSize: 120 }),
      ]);

      const uniqueCandidates = Array.from(
        new Map(
          popularPage.items
            .concat(ratedPage.items)
            .filter((candidate) => candidate.id !== target.id)
            .map((candidate) => [candidate.id, candidate]),
        ).values(),
      );

      const targetAccords = new Set(target.accords.map((accord) => accord.name.toLowerCase()));
      const targetNotes = new Set(
        target.notes.top.concat(target.notes.middle, target.notes.base).map((note) => note.toLowerCase()),
      );

      const scored = uniqueCandidates
        .map((candidate) => {
          const candidateAccords = candidate.accords.map((accord) => accord.name.toLowerCase());
          const candidateNotes = candidate.notes.top.concat(candidate.notes.middle, candidate.notes.base).map((note) => note.toLowerCase());

          const sharedAccords = candidateAccords.filter((accord) => targetAccords.has(accord));
          const sharedNotes = candidateNotes.filter((note) => targetNotes.has(note));
          const accordScore = sharedAccords.length * 3;
          const noteScore = sharedNotes.length * 2;
          const genderBonus =
            candidate.gender === target.gender || candidate.gender === 'unisex' || target.gender === 'unisex' ? 2 : 0;
          const qualityBonus = candidate.rating * 0.35 + Math.min(candidate.reviewCount / 1500, 2.5);

          return {
            ...candidate,
            matchScore: Math.round(Math.min(98, 58 + accordScore * 4 + noteScore * 3 + genderBonus * 3)),
            recommendationReason: sharedAccords.length
              ? `Shared accords: ${sharedAccords.slice(0, 3).join(', ')}`
              : sharedNotes.length
                ? `Shared notes: ${sharedNotes.slice(0, 3).join(', ')}`
                : 'Related through overall scent profile.',
            _score: accordScore + noteScore + genderBonus + qualityBonus,
          };
        })
        .sort((left, right) => right._score - left._score)
        .slice(0, 4)
        .map(({ _score, ...candidate }) => candidate);

      if (scored.length > 0) {
        return scored;
      }
    } catch {
      // Fall through to existing API / local fallback below.
    }
  }

  return [];
}

export async function getYouMightLike(favoriteIds: string[]): Promise<Perfume[]> {
  if (favoriteIds.length === 0) return [];

  const seedPerfumes = (await Promise.all(favoriteIds.slice(0, 12).map(getPerfumeById))).filter(Boolean) as Perfume[];
  if (seedPerfumes.length === 0) return [];

  const favoriteIdSet = new Set(favoriteIds);
  const accordWeights = new Map<string, number>();
  const noteWeights = new Map<string, number>();

  seedPerfumes.forEach((perfume) => {
    perfume.accords.slice(0, 5).forEach((accord, index) => {
      const key = accord.name.toLowerCase();
      accordWeights.set(key, (accordWeights.get(key) || 0) + Math.max(1, 5 - index));
    });

    perfume.notes.top.concat(perfume.notes.middle, perfume.notes.base).forEach((note) => {
      const key = note.toLowerCase();
      noteWeights.set(key, (noteWeights.get(key) || 0) + 1);
    });
  });

  const [popularPage, ratedPage] = await Promise.all([
    getPerfumesPage({ sortBy: 'reviews', page: 1, pageSize: 160 }),
    getPerfumesPage({ sortBy: 'rating', page: 1, pageSize: 160 }),
  ]);

  const candidatePool = Array.from(
    new Map(
      popularPage.items
        .concat(ratedPage.items)
        .filter((candidate) => !favoriteIdSet.has(candidate.id))
        .map((candidate) => [candidate.id, candidate]),
    ).values(),
  );

  return candidatePool
    .map((candidate) => {
      const accordScore = candidate.accords.reduce((sum, accord) => sum + (accordWeights.get(accord.name.toLowerCase()) || 0), 0);
      const noteScore = candidate.notes.top
        .concat(candidate.notes.middle, candidate.notes.base)
        .reduce((sum, note) => sum + (noteWeights.get(note.toLowerCase()) || 0), 0);
      const qualityBonus = candidate.rating * 0.4 + Math.min(candidate.reviewCount / 1200, 3);

      return {
        ...candidate,
        matchScore: Math.round(Math.min(96, 55 + accordScore * 2 + noteScore)),
        recommendationReason: 'Selected from the overlap between your saved fragrances and this scent profile.',
        _score: accordScore * 2 + noteScore + qualityBonus,
      };
    })
    .sort((left, right) => right._score - left._score)
    .slice(0, 4)
    .map(({ _score, ...candidate }) => candidate);
}
