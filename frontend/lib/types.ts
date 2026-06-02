export interface Note {
  name: string;
  category: string; // e.g., 'Citrus', 'Woody', 'Floral', 'Oriental'
  description?: string;
}

export interface Accord {
  name: string;
  percentage: number; // e.g., 70 for 70%
  color?: string; // Optional custom hex color representation
}

export interface Review {
  id: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  date: string;
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  gender: 'unisex' | 'male' | 'female' | 'men' | 'women';
  occasions: string[]; // e.g., ['Office', 'Date Night', 'Daily Wear', 'Formal Event']
  seasons: string[]; // e.g., ['Spring', 'Summer', 'Autumn', 'Winter', 'Cool Night', 'Warm Day']
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  accords: Accord[];
  longevity: number; // e.g., 8 for 8 hours (0-10)
  sillage: 'intimate' | 'moderate' | 'strong' | 'enormous';
  description: string;
  imageUrl: string;
  imageUrlSecondary?: string;
  rating: number;
  reviewCount: number;
  country?: string;
  year?: number;
  perfumers?: string[];
  matchScore?: number; // Only for AI matches, percentage 0-100
  recommendationReason?: string; // Only for AI matches
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  favoritePerfumes: string[]; // List of perfume IDs
  fragranceProfile?: {
    preferredFamilies: string[];
    avoidedNotes: string[];
  };
}

export interface ProfileRecord {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public?: boolean;
  show_favorites?: boolean;
  show_reviews?: boolean;
  fragrance_dna?: Record<string, unknown>;
}

export interface MatchFormInput {
  genderPreference: 'unisex' | 'male' | 'female' | 'any';
  preferredNotes: string[];
  avoidedNotes: string[];
  occasion: string;
  weather: string;
  style: string; // e.g. 'elegant', 'casual', 'sporty'
}

export interface MlMatchRequest {
  age_group: 'teen' | 'young_adult' | 'adult' | 'mature';
  activity: 'office' | 'date' | 'casual' | 'sport' | 'formal';
  weather: 'hot' | 'warm' | 'cool' | 'cold';
  style: 'fresh' | 'sweet' | 'elegant' | 'bold' | 'sporty';
  preferred_accords: string[];
  gender: 'men' | 'women' | 'unisex';
  top_k?: number;
}

export interface MlMatchResponse {
  recommendations: {
    id: number;
    name: string;
    brand: string;
    gender: string;
    accords: string;
    rating: number;
    review_count: number;
    match_score: number;
  }[];
}

export interface CatalogPerfume {
  id: number;
  name: string;
  brand: string;
  country: string;
  gender: string;
  rating: number;
  review_count: number;
  year?: number;
  notes_top: string[];
  notes_middle: string[];
  notes_base: string[];
  perfumers: string[];
  accords: string[];
}

export interface CatalogResponse {
  items: CatalogPerfume[];
  total: number;
  page: number;
  page_size: number;
}

export interface SupabasePerfumeRow {
  id: number;
  name: string;
  brand: string;
  country: string | null;
  gender: string;
  rating: number;
  review_count: number;
  release_year: number | null;
  description?: string | null;
  image_url?: string | null;
  image_url_secondary?: string | null;
  perfumer_1: string | null;
  perfumer_2: string | null;
  perfume_accords?: {
    position: number;
    accords: { name: string } | null;
  }[];
  perfume_notes?: {
    position: number;
    note_type: 'top' | 'middle' | 'base';
    notes: { name: string } | null;
  }[];
}

export interface MoodInput {
  moodString: string;
  weatherCondition?: string;
}

export interface SimilarityResult {
  perfumeId: string;
  score: number; // Similarity percentage (0-100)
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
