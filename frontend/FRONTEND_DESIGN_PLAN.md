# NemuParfang Frontend Design Plan

## 1. Design Direction

NemuParfang is a premium AI fragrance discovery platform, not an e-commerce store. The interface should feel like a calm private fragrance consultation: editorial, warm, precise, and personal.

The primary visual reference is the Stitch export in:

```text
desainfromstitch/stitch_nemuparfang_ui_components/
```

The exported screens contain several visual explorations. To avoid an inconsistent product, use the **Minimalist Luxury AI Consultant** direction as the canonical system:

- Warm alabaster canvas with white layered surfaces.
- Deep espresso typography and restrained bronze highlights.
- Large editorial serif headings paired with clean geometric labels.
- Thin borders, quiet shadows, and deliberate whitespace.
- AI interactions that feel guided and human, not like a technical dashboard.
- No prices, cart, checkout, or marketplace language.

## 2. Reference Priority

When references differ, follow this order:

1. `luxury_ai_fragrance_consultant/DESIGN.md`
2. `ai_match_quiz_step_3/screen.png`
3. `ai_match_your_fragrance_dna/screen.png`
4. `nemuparfang_condensed_landing_page/screen.png`
5. `dior_sauvage_detail_page/screen.png`
6. `nemuparfang_explore_page/screen.png`
7. Root `DESIGN.md` and existing React components

The `nemuparfang_navbar_component` and `nemuparfang_perfume_card_component` screens are useful layout explorations, but they include boutique or shopping-oriented wording. Reuse their composition ideas only after translating them into discovery language.

## 3. Canonical Design Tokens

### Color Palette

| Token | Value | Usage |
|---|---:|---|
| `parfang-bg` | `#FBFBFA` | Main gallery-like page background |
| `parfang-surface` | `#FFFFFF` | Cards, quiz options, inputs, panels |
| `parfang-text` | `#1C1B1A` | Primary headings and body text |
| `parfang-muted` | `#787470` | Secondary copy, metadata, captions |
| `parfang-accent` | `#B89775` | Primary CTA, active states, key insights |
| `parfang-accent-light` | `#D4B896` | Hover, gradient, subtle highlight |
| `parfang-accent-dark` | `#9A7D5E` | Pressed states and high-contrast bronze |
| `parfang-border` | `#E8E4DF` | Low-contrast borders and dividers |
| `parfang-overlay` | `rgba(28, 27, 26, 0.55)` | Image overlays and modal focus layer |
| `parfang-glow` | `rgba(184, 151, 117, 0.15)` | Selected quiz cards and AI highlights |

Keep bronze usage restrained. It is an interaction signal, not a background default. Avoid purple, blue, neon gradients, and aggressive dark-mode styling.

### Typography

| Role | Font | Guidance |
|---|---|---|
| Display | Philosopher | Hero copy, page titles, editorial headings |
| Body | Poppins | Descriptions, helper copy, controls |
| Labels | Josefin Sans | Uppercase navigation, tags, metadata, buttons |
| Accent | Shadows Into Light | Sparse emotional accent, Fragrance DNA title, consultant notes |

Recommended responsive scale:

| Role | Desktop | Mobile |
|---|---:|---:|
| Hero display | `64-80px` | `40-48px` |
| Page title | `48-56px` | `34-40px` |
| Section heading | `30-38px` | `26-32px` |
| Body | `15-16px` | `14-15px` |
| Label | `11-13px` | `10-12px` |

### Shape, Depth, and Spacing

- Use a consistent `8px` rhythm.
- Desktop content maximum width: `1280px`.
- Desktop page gutters: `64-144px` depending on viewport.
- Mobile gutters: `20px`.
- Section spacing: `88px` desktop and `48px` mobile.
- Standard border radius: `4px`.
- Friendly interactive cards: `8px`.
- Pills and circular controls: full radius only where semantically appropriate.
- Default depth: thin border first, subtle ambient shadow second.
- Selected depth: bronze border plus soft bronze glow.

## 4. Motion Principles

Motion should feel like breathing, not performing.

### Timing

| Interaction | Duration | Easing |
|---|---:|---|
| Hover, focus, button press | `200-300ms` | `ease-out` |
| Card reveal, drawer, quiz transition | `400-600ms` | `[0.22, 1, 0.36, 1]` |
| Hero stagger and page entrance | `600-900ms` | `[0.22, 1, 0.36, 1]` |

### Required Motion Patterns

- Navigation underline grows from left to right.
- Perfume card image crossfades on hover and reveals actions from below.
- Quiz options gain a bronze glow and checkmark when selected.
- Quiz questions transition horizontally based on next/back direction.
- Notes pyramid reveals layers from base to top and supports hover or tap.
- Fragrance DNA visualization animates once after results load.
- Loading states use skeletons or a restrained pulse, not blocking spinners where avoidable.
- Respect `prefers-reduced-motion`.

## 5. Global Experience Architecture

### Navigation

Use the existing three-layer navigation pattern on desktop:

```text
Utility bar: Account | Favorites | Login                     Language
Center bar: Search             NEMUPARFANG                    Profile
Main nav: HOME | EXPLORE | AI MATCH | MOOD | ABOUT | BLOG
```

On mobile:

- Collapse to a single sticky bar with logo, search, profile, and menu trigger.
- Use a full-height drawer with the same route hierarchy.
- Keep `AI MATCH` visually emphasized with a bronze label or border.
- Preserve active-route indicators.

### Footer

Use an editorial dark footer for contrast:

- Brand statement and tagline.
- Explore links.
- Account and help links.
- Legal links.
- Optional journal subscription field.
- No shopping, shipping, or returns wording unless the product scope changes.

### Shared States

Every data-driven page must support:

- Loading skeleton.
- Empty state with a useful next action.
- Recoverable error state.
- Offline or API unavailable message.
- Mobile-safe overflow and keyboard navigation.

## 6. Route-by-Route Design Plan

### `/` Landing Page

**Goal:** Explain the product within five seconds and guide the user toward AI Match or Explore.

Keep the current editorial landing composition, then polish its hierarchy:

1. Hero split layout with fragrance photography and a concise value proposition.
2. Primary CTA: `Mulai AI Match`.
3. Secondary CTA: `Jelajahi Parfum`.
4. Compact feature ribbon: AI Match, timeline, wardrobe, community, reviews, mood.
5. Editorial introduction explaining discovery-first positioning.
6. Curated collections with four visually varied perfume cards.
7. Dark full-width AI Match banner.
8. Situational discovery recommendations.
9. Olfactory journal preview.
10. Brand carousel and footer.

Interaction details:

- Use a staggered hero entrance.
- Add subtle image zoom on hover.
- Give collection cards image swap and reveal actions.
- Animate journal cards only as they enter the viewport.

### `/explore` Fragrance Library

**Goal:** Make 70,103 perfumes feel navigable rather than overwhelming.

Desktop structure:

```text
Editorial header
Search bar
Filter sidebar | result toolbar
Filter sidebar | perfume grid
Pagination or infinite-load boundary
```

Core filters:

- Search by perfume, brand, note, or accord.
- Gender: women, men, unisex.
- Accords.
- Notes.
- Country.
- Release year.
- Rating and minimum review count.
- Sort by relevance, popularity, rating, newest.

Use progressive disclosure:

- Show the most useful filters first.
- Place advanced filters inside an expandable group.
- Surface active filters as removable chips above the result grid.
- Use a mobile bottom sheet or drawer for filters.

Perfume cards should display:

- Brand.
- Perfume name.
- Gender.
- Top three accords.
- Rating and review count.
- Optional AI match score when the user has completed a profile.
- Favorite action and detail link.

Avoid adding occasion, concentration, longevity, or sillage until the real dataset reliably provides them.

### `/perfume/[id]` Fragrance Detail

**Goal:** Turn raw fragrance metadata into an editorial profile.

Page sections:

1. Breadcrumb and back action.
2. Product image gallery.
3. Perfume identity: brand, name, gender, rating, review count, year, country.
4. Main accords visual bars.
5. Description.
6. Interactive notes pyramid.
7. Perfumer metadata when available.
8. Similar fragrance carousel powered by Pinecone.
9. Community review section when Supabase reviews are connected.
10. Dark AI Match CTA banner.

Data-quality behavior:

- Hide unknown country instead of rendering `0`, `null`, or an empty label.
- Hide missing year and perfumer fields gracefully.
- Do not fabricate concentration, season, occasion, sillage, or longevity.
- Preserve useful empty states for missing notes.

### `/match` AI Fragrance Consultation

**Goal:** Make the ML recommendation flow the product centerpiece.

Use a distraction-free quiz shell with logo, `Exit Quiz`, progress bar, current step, and sticky bottom navigation. Do not reuse the full site navigation during the quiz.

Recommended six-step flow:

1. **Who is this scent for?** Any, women, men, or unisex.
2. **Which accords draw you in?** Select up to five preferred accords.
3. **What is your go-to vibe?** Confident, fresh, romantic, mysterious, playful, earthy.
4. **When will you wear it?** Daily, office, date night, formal, active, special event.
5. **Which notes should we avoid?** Optional multi-select with search.
6. **Fine-tune your profile.** Preferred brands, countries, and release-year range as optional advanced controls.

UX rules:

- Keep one question per screen.
- Explain that optional answers improve ranking but are not required.
- Disable `Next` only when a required choice is missing.
- Preserve answers when moving backward.
- Use selected cards with bronze outline, glow, and checkmark.
- On submit, show a short curated loading sequence explaining retrieval and ranking stages.

### `/match/results` Fragrance DNA Results

**Goal:** Translate ML output into a persuasive, understandable recommendation.

Results composition:

1. Personalized `Your Fragrance DNA` title.
2. Dominant accord visualization with bronze gradient.
3. Plain-language profile explanation.
4. Top recommendation hero card.
5. Four supporting recommendation cards.
6. Explanation chips: accord alignment, note overlap, gender fit, popularity signal.
7. CTA to view perfume detail.
8. CTA to adjust answers.
9. CTA to save profile after authentication.

Important trust principle:

- Do not expose internal model jargon such as LightGBM, embeddings, or NDCG in the consumer UI.
- Explain recommendations using human-readable reasons derived from real matched features.

### `/mood` Mood Discovery

**Goal:** Provide a lighter, faster alternative to the full AI quiz.

Use an atmospheric single-screen selector:

- Mood cards: focused, calm, energetic, romantic, confident, mysterious.
- Optional context: daytime, weather, and event.
- Hero background changes softly as mood changes.
- Results update after confirmation, not on every hover.
- Offer a transition to the full AI Match flow for deeper personalization.

### `/login` and `/register`

**Goal:** Introduce authentication without breaking the premium editorial mood.

Use a two-column layout:

- Left: atmospheric fragrance image with subtle overlay and a short brand statement.
- Right: compact Supabase Auth form.

Support:

- Email and password.
- Password visibility toggle.
- Clear inline validation.
- Loading state.
- Error state.
- Link between login and registration.
- Optional password reset entry point.

Keep auth lightweight. Do not block browsing or AI Match experimentation; require login only when saving favorites, wardrobe, reviews, or Fragrance DNA.

### `/profile`

**Goal:** Make personalization feel useful after authentication.

Sections:

1. Profile header with avatar and lightweight editing.
2. Saved Fragrance DNA summary.
3. Favorites.
4. Wardrobe.
5. Recently viewed fragrances.
6. Saved AI Match sessions.

Use tabs on desktop and a horizontally scrollable segmented control on mobile.

## 7. Component Roadmap

### Reuse and Refine Existing Components

- `Navbar`: retain structure, add active route state and mobile drawer.
- `PerfumeCard`: retain image crossfade, add real metadata fallback handling.
- `NotesPyramid`: retain SVG interaction, add tap support and reduced-motion behavior.
- `AccordBar`: retain for details and DNA explanation.
- `Container`: standardize layout gutters.
- `SectionHeader`: standardize editorial section rhythm.

### New Shared Components

| Component | Purpose |
|---|---|
| `Button` | Canonical primary, secondary, and ghost variants |
| `PageHero` | Reusable editorial heading block |
| `FilterChip` | Active filter state with remove action |
| `EmptyState` | Reusable data-empty treatment |
| `SkeletonCard` | Stable grid loading state |
| `MobileDrawer` | Navigation and filter drawers |
| `FavoriteButton` | Auth-aware favorite interaction |

### New AI Components

| Component | Purpose |
|---|---|
| `QuizShell` | Progress, header, navigation, directional transitions |
| `QuizOptionCard` | Selected glow, accessible radio or checkbox semantics |
| `AccordPicker` | Multi-select accord choices |
| `NoteExclusionPicker` | Searchable avoided-note selection |
| `FragranceDnaChart` | Animated premium profile visualization |
| `RecommendationReason` | Human-readable ranking explanation |
| `RecommendationCard` | Match score and feature explanation |

## 8. Real Data and ML Integration

The current frontend still uses local mock perfume and recommendation data. The design should be implemented against typed API contracts so that real services can replace mocks without redesigning pages.

### Explore and Details

Use a frontend adapter that maps API data into the existing `Perfume` view model:

| API Field | UI Field |
|---|---|
| `id` | `id` |
| `name` | `name` |
| `brand` | `brand` |
| `gender` | `gender` |
| `rating` | `rating` |
| `review_count` | `reviewCount` |
| `accords` | `accords` |
| `notes_top` | `notes.top` |
| `notes_middle` | `notes.middle` |
| `notes_base` | `notes.base` |
| `country` | optional metadata |
| `year` | optional metadata |
| `perfumers` | optional metadata |

### AI Match

The quiz payload should map to the ranker profile format:

```ts
interface AiMatchRequest {
  gender?: 'women' | 'men' | 'unisex';
  preferredAccords: string[];
  preferredNotes: string[];
  avoidedNotes: string[];
  preferredBrands: string[];
  preferredCountries: string[];
  minYear?: number;
  maxYear?: number;
  vibe?: string;
  occasion?: string;
  weather?: string;
}
```

Only send fields supported by the backend. Vibe, occasion, and weather may be translated into preferred accords or kept as explanatory context until training supports them directly.

## 9. Accessibility and Responsive Requirements

Required baseline:

- Meet WCAG AA contrast for text and controls.
- Add visible keyboard focus states.
- Use semantic headings and form labels.
- Ensure quiz cards use proper radio or checkbox semantics.
- Provide alt text for meaningful images and empty alt text for decorative images.
- Never rely on hover alone; mirror interactions with focus and tap.
- Make touch targets at least `44px`.
- Avoid layout shift by reserving image and skeleton dimensions.
- Support screen widths from `320px` upward.
- Respect reduced motion preferences.

## 10. Implementation Order

### Phase A: Foundation Cleanup

1. Consolidate design tokens and remove conflicting arbitrary styles.
2. Add reusable button, loading, empty-state, and drawer primitives.
3. Audit current landing, explore, and detail pages for mobile behavior.
4. Add robust fallback handling for raw dataset metadata.

### Phase B: Core AI Experience

1. Build `/match`.
2. Build `/match/results`.
3. Connect AI Match to the FastAPI ranker endpoint.
4. Add recommendation explanations based on real feature overlap.

### Phase C: Real Catalog

1. Replace `lib/api/perfumes.ts` mocks with a typed API adapter.
2. Connect explore pagination and filters to real data.
3. Connect perfume detail metadata.
4. Connect Pinecone-backed similar perfumes.

### Phase D: Personalization

1. Build `/login` and `/register` with Supabase Auth.
2. Build `/profile`.
3. Connect favorites and wardrobe.
4. Add saved Fragrance DNA.

### Phase E: Mood and Polish

1. Build `/mood`.
2. Refine page transitions and reduced-motion support.
3. Add SEO metadata, image optimization, and performance checks.
4. Run accessibility and mobile audits.

## 11. Definition of Done

Before marking the frontend ready:

- The visual language stays consistent across all routes.
- Existing Stitch screens are respected without copying shopping-specific language.
- AI Match works end-to-end with real backend data.
- Explore handles the full catalog through server-side pagination.
- Perfume details never display fabricated values.
- Unknown metadata is hidden gracefully.
- Loading, error, and empty states exist for every data-driven screen.
- Desktop and mobile interactions both work.
- Keyboard navigation and visible focus states work.
- `npm run build` completes successfully.
- A manual visual pass is completed for mobile, tablet, and desktop.

