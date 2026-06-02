# NemuParfang API Docs

This document describes the current API surface used by NemuParfang.

The system is split across:

- `Supabase REST + Auth` for product data and user actions
- `FastAPI` for AI matching and ML-backed catalog services

## 1. FastAPI Service

Base URL:

```text
NEXT_PUBLIC_API_URL
```

Local default:

```text
http://localhost:8000
```

### `GET /health`

Health check for the ML service.

Response example:

```json
{
  "status": "ok",
  "encoder_loaded": true,
  "ranker_loaded": true,
  "dataset_rows": 70103,
  "pinecone_connected": true
}
```

### `GET /perfumes`

Browse the ML service catalog.

Query params:

- `search`
- `gender`
- `accord`
- `country`
- `min_rating`
- `page`
- `page_size`

Response:

```json
{
  "items": [
    {
      "id": 76,
      "name": "Sauvage",
      "brand": "Dior",
      "country": "France",
      "gender": "men",
      "rating": 4.2,
      "review_count": 12000,
      "year": 2015,
      "notes_top": ["bergamot"],
      "notes_middle": ["lavender"],
      "notes_base": ["ambroxan"],
      "perfumers": ["Francois Demachy"],
      "accords": ["fresh spicy", "citrus", "amber"]
    }
  ],
  "total": 70103,
  "page": 1,
  "page_size": 24
}
```

### `GET /perfumes/{perfume_id}`

Returns one catalog perfume by integer ID.

### `GET /perfumes/{perfume_id}/similar`

ML-backed similar perfume lookup from the FastAPI service.

Query params:

- `top_k` default `6`

Note:

- in the frontend product, Phase 2 similar recommendations are currently rule-based from Supabase data
- this endpoint still exists for the separate ML path and future Phase 3 serving work

### `GET /notes`

Returns aggregated note counts.

Query params:

- `search`
- `limit`

### `POST /match`

Main AI fragrance match endpoint.

Request body:

```json
{
  "age_group": "young_adult",
  "activity": "date",
  "weather": "warm",
  "style": "elegant",
  "preferred_accords": ["woody", "amber", "vanilla"],
  "gender": "unisex",
  "top_k": 10
}
```

Response:

```json
{
  "recommendations": [
    {
      "id": 1234,
      "name": "Example Perfume",
      "brand": "Example Brand",
      "gender": "unisex",
      "accords": "woody, amber, vanilla",
      "rating": 4.3,
      "review_count": 921,
      "match_score": 0.873421
    }
  ]
}
```

## 2. Supabase Product Data

The frontend uses Supabase directly for most product features.

Base URL:

```text
NEXT_PUBLIC_SUPABASE_URL
```

The frontend currently talks to:

- `auth/v1` for sign in / sign up
- `rest/v1/perfumes`
- `rest/v1/reviews`
- `rest/v1/profiles`
- `rest/v1/user_perfumes`
- `rest/v1/community_posts`
- `rest/v1/community_post_likes`
- `rest/v1/community_post_reposts`
- `rest/v1/community_post_comments`
- `storage/v1/object/community-media/...`

### Auth

Used by:

- `frontend/lib/api/auth.ts`

Supported actions:

- sign up
- sign in

Auth model:

- Supabase access token is stored in frontend auth state
- profile data is loaded separately from the `profiles` table

### Perfumes

Used by:

- `frontend/lib/api/perfumes.ts`

Primary source of truth in the frontend:

- perfume images
- accords
- note pyramids
- review counts
- pagination

Important fields:

- `id`
- `source_url`
- `name`
- `brand`
- `country`
- `gender`
- `rating`
- `review_count`
- `release_year`
- `description`
- `image_url`
- `image_url_secondary`
- `perfumer_1`
- `perfumer_2`

Related tables:

- `perfume_notes`
- `notes`
- `perfume_accords`
- `accords`

### Collections

Used by:

- `frontend/lib/api/collections.ts`

Table:

- `user_perfumes`

Collection types:

- `favorite`
- `wardrobe`

Behavior:

- optimistic UI in the frontend
- server persistence via Supabase REST

### Reviews

Used by:

- `frontend/lib/api/reviews.ts`

Table:

- `reviews`

Supported actions:

- load perfume reviews
- create review
- update own review
- delete own review
- load reviews for a public profile

Current rating system:

- user input: integer 1 to 5 stars
- displayed average can be decimal

### Profiles

Used by:

- `frontend/lib/api/profile.ts`

Table:

- `profiles`

Supported fields:

- `username`
- `display_name`
- `avatar_url`
- `bio`
- `is_public`
- `show_favorites`
- `show_reviews`

Public profile route:

```text
/u/[username]
```

Privacy behavior:

- profiles are private by default
- wardrobe remains private
- favorites and reviews are only shown publicly when the owner enables them

### Community Feed

Used by:

- `frontend/lib/api/community.ts`

Tables:

- `community_posts`
- `community_post_likes`
- `community_post_reposts`
- `community_post_comments`

Storage:

- bucket: `community-media`

Supported actions:

- create post with text
- create post with static image
- create post with text + image
- like / unlike
- repost / remove repost
- comment
- search posts
- search public profiles from the same page

Moderation:

- current MVP moderation is keyword-based
- blocks explicit NSFW and SARA language heuristically
- only static `jpg`, `jpeg`, and `png` uploads are accepted

## 3. Frontend Fallback Strategy

The frontend is intentionally resilient:

- for catalog pages, it prefers Supabase data when public config is available
- some AI and catalog features can fall back to the FastAPI service
- some older flows still retain mock or defensive fallback behavior for stability during development

## 4. Environment Variables

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to the browser

### FastAPI service

```env
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=nemuparfang-perfumes
FRONTEND_ORIGIN=http://localhost:3000
```

## 5. Current Recommendation Split

This matters when debugging.

### Rule-based in frontend / Supabase layer

- similar perfumes on detail page
- you might like on homepage

These are Phase 2 recommendation features and do not require Pinecone.

### ML-backed in FastAPI layer

- `/match`
- service-side `/perfumes/{id}/similar`

These are the deeper AI/ML serving paths and are the natural focus for Phase 3 hardening.
