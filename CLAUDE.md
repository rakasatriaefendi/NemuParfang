# NemuParfang — Claude Instructions

## Identitas Proyek

**Nama:** NemuParfang  
**Tagline:** *Skip the sniff, just pick and click!*  
**Deskripsi singkat:** Platform AI-powered untuk rekomendasi dan eksplorasi parfum personal.  
**Stack utama:** Next.js 14, TailwindCSS, shadcn/ui, Supabase, Python (FastAPI untuk ML)

---

## Konteks Proyek

NemuParfang adalah aplikasi web full-stack dengan komponen AI/ML. Kamu membantu developer dalam membangun seluruh aspek proyek ini — dari skema database, komponen UI, API routes, hingga model machine learning.

Proyek ini memiliki empat phase:
- **Phase 1** — Foundation (Auth, DB, Browse, Detail parfum)
- **Phase 2** — Personalization (Favorites, Wishlist, Reviews, Rekomendasi rule-based)
- **Phase 3** — AI & ML (Similarity engine, predictor, mood mapping, NLP)
- **Phase 4** — Polish & Deployment

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS + shadcn/ui
- **State management:** Zustand atau React Context
- **Fetching:** TanStack Query (React Query)
- **Animasi:** Framer Motion

### Backend
- **API Routes:** Next.js API Routes / middleware seperlunya untuk UX dan route protection
- **ML API:** FastAPI (Python) — dihosting terpisah di Hugging Face Spaces / platform inference lain
- **Auth:** Supabase Auth (email/password + OAuth Google)
- **Database:** Supabase (PostgreSQL)
- **Storage:** External image URLs untuk katalog parfum MVP, Supabase Storage hanya bila benar-benar diperlukan

### Machine Learning (Python)
- **Library:** scikit-learn, pandas, numpy
- **NLP:** transformers (HuggingFace) atau TextBlob untuk sentiment
- **Similarity:** cosine_similarity dari sklearn
- **Model predictor:** Random Forest / XGBoost
- **Serving:** FastAPI endpoint

### Deployment
- **Frontend:** Vercel
- **ML API:** Railway atau Render
- **Database & Auth:** Supabase Cloud

## Progress Terkini

- **Phase 1** secara substansial selesai
- Dataset Supabase penuh sudah masuk:
  - `70103 perfumes`
  - `1867 notes`
  - `88 accords`
  - `437781 perfume_notes`
  - `329093 perfume_accords`
- Favorites, wardrobe, login/register, profile, dan protected routes sudah usable
- FastAPI service tetap diperlakukan sebagai backend ML/recommendation terpisah

---

## Struktur Folder

Struktur aktual repo saat ini:

```text
nemuparfang/
├── frontend/                   # Next.js frontend application
│   ├── app/                    # App Router pages and layouts
│   ├── components/             # UI, perfume, profile, and shared components
│   ├── lib/                    # API clients, types, and utilities
│   ├── public/                 # Runtime static assets
│   ├── middleware.ts           # Route protection middleware
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local              # Frontend runtime env (local only)
├── backend/
│   └── supabase/               # Schema SQL + seed tooling for auth/database
│       ├── schema.sql
│       └── seed_perfumes.py
├── nemuparfang-api/            # FastAPI service for catalog/ML endpoints
│   ├── app.py
│   ├── src/
│   ├── artifacts/
│   ├── data/
│   └── requirements.txt
├── ml_training_notebooks/      # Offline training and notebook artifacts
└── CLAUDE.md
```

Catatan: blok struktur lama di bawah ini adalah struktur perencanaan awal dan tidak lagi menjadi source of truth.

```
nemuparfang/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing / Home
│   │   ├── explore/page.tsx    # Browse parfum
│   │   ├── perfume/[id]/page.tsx
│   │   ├── match/page.tsx      # AI Perfume Match (Phase 3)
│   │   ├── mood/page.tsx       # Mood-to-Perfume (Phase 3)
│   │   └── profile/page.tsx
│   └── api/
│       ├── perfumes/
│       ├── favorites/
│       └── reviews/
├── components/
│   ├── ui/                     # shadcn components
│   ├── perfume/
│   │   ├── PerfumeCard.tsx
│   │   ├── NotesPyramid.tsx
│   │   ├── AccordBar.tsx
│   │   └── SimilarPerfumes.tsx
│   ├── recommendation/
│   │   ├── MatchForm.tsx
│   │   └── MoodSelector.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── SearchBar.tsx
│       └── FilterPanel.tsx
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── types.ts                # TypeScript types
│   └── utils.ts
├── hooks/
│   ├── usePerfumes.ts
│   ├── useFavorites.ts
│   └── useRecommendations.ts
└── ml_api/                     # FastAPI (Python)
    ├── main.py
    ├── models/
    │   ├── similarity.py
    │   ├── predictor.py
    │   └── sentiment.py
    ├── data/
    │   └── perfumes.csv
    └── requirements.txt
```

---

## Konvensi Kode

### TypeScript / Next.js
- Gunakan **TypeScript strict mode**
- Komponen React menggunakan **functional components** dengan arrow function
- Nama komponen **PascalCase**, file komponen juga **PascalCase**
- Hooks custom prefix `use` → `usePerfumes`, `useFavorites`
- API routes di `app/api/` menggunakan **Route Handlers** (Next.js 14)
- Semua tipe didefinisikan di `lib/types.ts`

### Supabase
- Client Supabase diinisialisasi di `lib/supabase.ts`
- Gunakan **server-side Supabase client** untuk Server Components
- Gunakan **client-side Supabase client** untuk Client Components dan interaksi auth
- RLS (Row Level Security) aktif di semua tabel yang melibatkan user data

### TailwindCSS
- Gunakan **utility classes** langsung, hindari custom CSS kecuali sangat perlu
- Komponen yang kompleks boleh gunakan `cn()` dari `lib/utils.ts` (clsx + tailwind-merge)
- Desain mobile-first: selalu mulai dari mobile, lalu `sm:`, `md:`, `lg:`

### Python / FastAPI
- Endpoint ML di `ml_api/main.py`
- Setiap model ML ada file terpisah di `ml_api/models/`
- Endpoint menggunakan **Pydantic models** untuk request/response validation
- CORS dikonfigurasi untuk menerima request dari domain frontend

---

## Tipe Data Utama (TypeScript)

```typescript
// lib/types.ts

export type Concentration = 'EDT' | 'EDP' | 'Parfum' | 'Cologne' | 'EDC'
export type Gender = 'masculine' | 'feminine' | 'unisex'
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all'
export type Occasion = 'office' | 'night' | 'casual' | 'sport' | 'formal'
export type NoteCategory = 'top' | 'middle' | 'base'
export type FavoriteType = 'owned' | 'wishlist'
export type Sentiment = 'positive' | 'negative' | 'neutral'

export interface Note {
  id: string
  name: string
  category: NoteCategory
}

export interface Accord {
  id: string
  name: string
}

export interface Perfume {
  id: string
  name: string
  brand: string
  gender: Gender
  concentration: Concentration
  year_release: number | null
  longevity: number       // 1–5
  sillage: number         // 1–5
  season: Season
  occasion: Occasion
  image_url: string | null
  notes: Note[]
  accords: Accord[]
  avg_rating?: number
  review_count?: number
}

export interface Review {
  id: string
  user_id: string
  perfume_id: string
  rating: number          // 1–5
  content: string
  sentiment: Sentiment | null
  created_at: string
  user?: {
    username: string
    avatar_url: string | null
  }
}

export interface UserProfile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
}

export interface FavoriteItem {
  user_id: string
  perfume_id: string
  type: FavoriteType
  perfume: Perfume
}

// ML API Types
export interface MatchFormInput {
  age_group: 'teen' | 'young_adult' | 'adult' | 'mature'
  activity: 'office' | 'outdoor' | 'sport' | 'date' | 'casual'
  weather: 'hot' | 'warm' | 'cool' | 'cold'
  style: 'formal' | 'casual' | 'sporty' | 'elegant' | 'edgy'
  preferred_accords: string[]
}

export interface MoodInput {
  mood: 'confident' | 'romantic' | 'mysterious' | 'classy' | 'fresh' | 'playful'
}

export interface SimilarityResult {
  perfume: Perfume
  similarity_score: number
}
```

---

## Endpoint ML API (FastAPI)

```
POST /api/match
  Body: MatchFormInput
  Returns: Perfume[] (top 5 recommendations)

POST /api/mood
  Body: MoodInput
  Returns: Perfume[] (top 5 recommendations)

POST /api/similar
  Body: { perfume_id: string }
  Returns: SimilarityResult[] (top 10 similar)

POST /api/sentiment
  Body: { text: string }
  Returns: { sentiment: Sentiment, confidence: float, keywords: string[] }
```

---

## Supabase RLS Policies (Ringkasan)

| Tabel | Read | Insert | Update | Delete |
|---|---|---|---|---|
| perfumes | Public | Admin only | Admin only | Admin only |
| notes | Public | Admin only | Admin only | Admin only |
| accords | Public | Admin only | Admin only | Admin only |
| reviews | Public | Auth users | Own review | Own review |
| favorites | Own data | Auth users | — | Own data |
| profiles | Public | Auth users | Own profile | — |

---

## Catatan Penting

1. **Phase pertama selalu foundation dulu** — jangan loncat ke ML sebelum database dan auth stabil.
2. **Seed data parfum** — mulai dengan 50–100 parfum populer (Dior, YSL, Versace, Tom Ford, dll) sebagai data awal yang representatif.
3. **NotesPyramid component** — ini fitur visual kunci. Buat interaktif dan animasi. Jangan plain text.
4. **ML API terpisah** — jangan taruh Python di dalam Next.js. FastAPI jalan di service terpisah, komunikasi lewat HTTP.
5. **Image parfum** — untuk MVP katalog penuh, gunakan URL eksternal yang diturunkan dari `source_url` Fragrantica. Jangan paksa upload puluhan ribu gambar ke storage project kecil.
6. **Cold start recommendation** — untuk user baru yang belum punya favorites, tampilkan rekomendasi berbasis popularitas atau "top rated".
7. **Mobile first** — banyak user parfum Indonesia browsing lewat HP.

---

## Perintah Dev

```bash
# Install dependencies
cd frontend
npm install

# Jalankan dev server Next.js
npm run dev

# Type-check frontend
npm run typecheck

# Jalankan ML API (dari folder nemuparfang-api)
cd nemuparfang-api
uvicorn app:app --reload --port 8000

# Generate Supabase types
npx supabase gen types typescript --project-id <project_id> > frontend/lib/database.types.ts
```
