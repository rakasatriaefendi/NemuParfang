# NemuParfang

NemuParfang is a fragrance discovery web app built with a hybrid architecture:

- `frontend/` contains the Next.js product UI
- `backend/supabase/` contains schema, migrations, and seed utilities
- `nemuparfang-api/` contains the FastAPI recommendation service

The current product includes:

- large perfume catalog browsing from Supabase
- search, filters, and pagination
- favorites and wardrobe collections
- review and rating system
- opt-in public profiles with privacy controls
- community feed with text and static image posts
- rule-based recommendations for similar perfumes and homepage suggestions
- a separate ML match service for deeper AI fragrance matching

## Architecture

NemuParfang is not a single monolithic backend.

- `Next.js` handles the frontend, page routing, and client-side integration
- `Supabase` handles auth, catalog storage, reviews, collections, profiles, and community data
- `FastAPI` handles the ML-powered match and catalog-serving endpoints used by the AI layer

This keeps Phase 1 and Phase 2 fast to ship while leaving room for deeper ML work in Phase 3.

## Repository Structure

```text
NemuParfang/
├── frontend/                 # Next.js app
├── backend/
│   ├── supabase/             # schema, migrations, seed scripts
│   └── fragrantica_image_sync/
├── nemuparfang-api/          # FastAPI + Pinecone + ranker service
├── ml_training_notebooks/    # offline experimentation / artifacts prep
└── README.md
```

## Local Setup

### 1. Frontend

From `frontend/`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required frontend env values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase

Apply the schema and migrations from:

- `backend/supabase/schema.sql`
- `backend/supabase/migrations/`

For bulk seed or image URL backfills, set:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then use:

```bash
python backend/supabase/seed_perfumes.py --commit
```

### 3. FastAPI ML Service

From `nemuparfang-api/`:

```bash
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Required ML env values:

```env
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=nemuparfang-perfumes
FRONTEND_ORIGIN=http://localhost:3000
```

## Dataset and Images

- perfume catalog source: `nemuparfang-api/data/perfume_cleaned_export.csv`
- Supabase `perfumes.id` is aligned with CSV row index and Pinecone vector IDs
- perfume image URLs are derived from Fragrantica source URLs and stored in Supabase
- community uploads go to the Supabase storage bucket `community-media`

## Product Status

### Phase 1

Foundation is complete:

- catalog
- auth
- detail pages
- collections
- protected routes
- full perfume seed

### Phase 2

Social and personalization are complete in the current MVP:

- favorites
- wardrobe
- reviews
- opt-in public profiles
- community feed
- rule-based recommendations

### Phase 3

The next focus is deeper AI and ML stabilization:

- stronger serving for AI match and mood flows
- better explanation layers
- production-hardening of recommendation infrastructure

## Scripts

### Frontend

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

### Supabase seed

```bash
python backend/supabase/seed_perfumes.py --commit
```

### ML API

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for:

- FastAPI endpoints
- Supabase-backed data flows
- request and response shapes
- environment notes

## Notes

- public profiles are opt-in
- wardrobe stays private
- community uploads are limited to static JPG and PNG in the current MVP
- the app intentionally uses both rule-based and ML layers depending on feature scope
