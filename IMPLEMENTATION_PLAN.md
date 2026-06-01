# NemuParfang AI Fragrance Discovery — Implementation Plan

Scaffold and build a production-ready **Next.js 14 App Router** application in TypeScript for **NemuParfang**, a premium AI-powered perfume discovery platform. 

The implementation will closely follow the Stitch screens and the provided [DESIGN.md](file:///c:/porto/NemuParfang/DESIGN.md) system for layout, typography, colors, and subtle premium animations (Framer Motion). 

---

## User Review Required

Please review the proposed tech stack, folder structure, and design translation before approving.

> [!IMPORTANT]
> - **Product Discovery Only:** The UI contains no cart, checkout, prices, or shopping features, keeping the branding focused strictly on fragrance profiling and editorial discovery.
> - **Asset Location:** All high-quality screenshots and placeholder graphics are located in [NemuParfangAssetsImage](file:///c:/porto/NemuParfang/NemuParfangAssetsImage) and will be mapped directly to local paths in Next.js `public/assets/`.
> - **Mock Data & Service API Contracts:** Data structures for `Perfume`, `Note`, `Accord`, etc. are fully typed, and the API logic is segregated into `lib/api/` for easy migration to Supabase or a FastAPI machine learning microservice later.

---

## Open Questions

*No blocking questions.* The design system in [DESIGN.md](file:///c:/porto/NemuParfang/DESIGN.md) and the HTML exported from the Stitch MCP server provide full configuration details.

---

## Proposed Changes

### Configuration & Base Environment

#### [NEW] [package.json](file:///c:/porto/NemuParfang/package.json)
- Define Next.js 14, React 18, TailwindCSS v3, Framer Motion, TanStack Query, and Zod dependencies.
- Define scripts: `dev` (`next dev`), `build` (`next build`), `start` (`next start`), and `lint`.

#### [NEW] [tsconfig.json](file:///c:/porto/NemuParfang/tsconfig.json)
- Standard strict-mode TypeScript config for Next.js, including import aliases `@/*` mapping to `./*`.

#### [NEW] [tailwind.config.js](file:///c:/porto/NemuParfang/tailwind.config.js)
- Configure the custom color palette (`parfang-bg`, `parfang-surface`, `parfang-text`, `parfang-accent`, `parfang-muted`, `parfang-border`, `parfang-overlay`).
- Configure custom typography (`Philosopher` for display, `Josefin Sans` for nav/labels, `Poppins` / `Inter` for body).
- Extend letter spacing and animations (`fade-in`, `slide-up`, etc.).

#### [NEW] [postcss.config.js](file:///c:/porto/NemuParfang/postcss.config.js)
- Standard PostCSS configuration with TailwindCSS and Autoprefixer.

#### [NEW] [next.config.mjs](file:///c:/porto/NemuParfang/next.config.mjs)
- Next.js configuration enabling strict mode and routing.

#### [NEW] [app/globals.css](file:///c:/porto/NemuParfang/app/globals.css)
- Set up Tailwind directives.
- Define CSS Variables for custom tokens (`--parfang-bg`, `--parfang-accent-light`, etc.).
- Inject Google Fonts via `@import` statement.
- Define global transition guidelines and custom classes (`glass-card`, etc.).

---

### Data & API Architecture

#### [NEW] [lib/types.ts](file:///c:/porto/NemuParfang/lib/types.ts)
- TypeScript interfaces:
  - `Perfume` (id, name, brand, gender, occasion, season, notes, accords, longevity, sillage, description, imageUrl, imageUrlSecondary, rating, reviewCount, matchScore, recommendationReason).
  - `Note` (name, category, description).
  - `Accord` (name, color).
  - `Review` (id, userName, userAvatar, rating, content, sentiment, date).
  - `UserProfile` (id, name, email, favoritePerfumes, fragranceProfile).
  - `MatchFormInput` (genderPreference, preferredNotes, avoidedNotes, occasion, weather, style).
  - `MoodInput` (moodString, weatherCondition).
  - `SimilarityResult` (perfumeId, score).
  - `ApiResponse<T>` (data, error, status).

#### [NEW] [lib/constants.ts](file:///c:/porto/NemuParfang/lib/constants.ts)
- Static lookup dictionaries for fragrance notes (Woody, Fresh, Floral, Oriental), occasions, sillage scales, and longevity scales.

#### [NEW] [lib/mock-data.ts](file:///c:/porto/NemuParfang/lib/mock-data.ts)
- Comprehensive mock database of premium perfumes (e.g. Dior Sauvage, YSL Libre, Chanel Bleu, plus custom ones matching Stitch like "Morning Fresh", "Night Elegant", "Amber Veil") with detailed accords, notes pyramid, longevity metrics, and high-fidelity descriptions.

#### [NEW] [lib/api/client.ts](file:///c:/porto/NemuParfang/lib/api/client.ts)
- Base client config referencing environment variables for API endpoints (FastAPI / Supabase placeholders).

#### [NEW] [lib/api/perfumes.ts](file:///c:/porto/NemuParfang/lib/api/perfumes.ts)
- Mock fetchers simulating latency:
  - `getPerfumes(filters?: { occasion?: string; note?: string; search?: string })`
  - `getPerfumeById(id: string)`
  - `getFeaturedPerfumes()`

#### [NEW] [lib/api/recommendations.ts](file:///c:/porto/NemuParfang/lib/api/recommendations.ts)
- Mock fetchers simulating recommendation logic:
  - `getAiMatch(input: MatchFormInput)`
  - `getMoodMatch(mood: string)`
  - `getSimilarPerfumes(id: string)`

#### [NEW] [lib/env.ts](file:///c:/porto/NemuParfang/lib/env.ts)
- Simple safe parsing of client-side/server-side environment variables with fallback defaults.

#### [NEW] [lib/utils.ts](file:///c:/porto/NemuParfang/lib/utils.ts)
- Utility helper `cn` for dynamic Tailwind class-merging.

---

### Layout & Global UI Elements

#### [NEW] [components/shared/Container.tsx](file:///c:/porto/NemuParfang/components/shared/Container.tsx)
- Reusable page container enforcing the layout grid widths.

#### [NEW] [components/shared/SectionHeader.tsx](file:///c:/porto/NemuParfang/components/shared/SectionHeader.tsx)
- Unified typography for section headers (subtitle uppercase tracking-widest, main display font).

#### [NEW] [components/shared/Navbar.tsx](file:///c:/porto/NemuParfang/components/shared/Navbar.tsx)
- 3-layer navbar matching Stitch design:
  - Top Bar (My Account, Login, language selectors).
  - Center Bar (Minimal Search input, centered luxury NemuParfang wordmark, profile icon).
  - Bottom Bar (Nav links with Framer Motion slide-in underline hover states).
- Explore link containing a Mega Menu featuring category image previews.

#### [NEW] [components/shared/Footer.tsx](file:///c:/porto/NemuParfang/components/shared/Footer.tsx)
- Elegant editorial footer with minimal description, curated categories list, and legal links.

#### [NEW] [app/(main)/layout.tsx](file:///c:/porto/NemuParfang/app/(main)/layout.tsx)
- Next.js root layout initializing fonts, wrappers, metadata, Navbar, and Footer.

---

### Landing Page Sections

#### [NEW] [app/(main)/page.tsx](file:///c:/porto/NemuParfang/app/(main)/page.tsx)
- Serves the homepage sections, wrapped in Framer Motion scroll-reveal containers.

#### [NEW] [components/home/HeroSection.tsx](file:///c:/porto/NemuParfang/components/home/HeroSection.tsx)
- Editorial split layout: Left side contains a staggered fade-in text reveal + CTA buttons; Right side features a smooth zoom-on-hover image and a floating "Recommended for" card.

#### [NEW] [components/home/AiMatchCta.tsx](file:///c:/porto/NemuParfang/components/home/AiMatchCta.tsx)
- Banner section drawing attention to the AI perfume match engine with decorative tags.

#### [NEW] [components/home/OccasionSection.tsx](file:///c:/porto/NemuParfang/components/home/OccasionSection.tsx)
- Bento grid layout for browsing occasions (Office, Daily Wear, Date Night, Formal, Sport). Includes cover photo effects on hover.

#### [NEW] [components/home/NotesSection.tsx](file:///c:/porto/NemuParfang/components/home/NotesSection.tsx)
- Dynamic chips row presenting olfactory note categories (Citrus, Floral, Woody, Vanilla, Amber). Clicking redirects to explore with pre-filtered settings.

#### [NEW] [components/home/WeatherRecommendation.tsx](file:///c:/porto/NemuParfang/components/home/WeatherRecommendation.tsx)
- Displays situational perfume cards (e.g. Morning Fresh, Night Elegant) based on time/weather.

#### [NEW] [components/home/FeaturedPerfumes.tsx](file:///c:/porto/NemuParfang/components/home/FeaturedPerfumes.tsx)
- Prominently showcases "Amber Veil" or other curated spotlight profiles in an asymmetric details display.

#### [NEW] [components/home/GuidePreview.tsx](file:///c:/porto/NemuParfang/components/home/GuidePreview.tsx)
- Elegant preview grids for articles/discovery journals.

---

### Perfume Discovery & Details Pages

#### [NEW] [components/perfume/PerfumeCard.tsx](file:///c:/porto/NemuParfang/components/perfume/PerfumeCard.tsx)
- Product card showing fragrance brand, name, gender, occasion, accords, longevity, and rating.
- Hover interaction: image transitions to secondary view, detail overlays appear, and shadow intensifies.

#### [NEW] [components/perfume/NotesPyramid.tsx](file:///c:/porto/NemuParfang/components/perfume/NotesPyramid.tsx)
- Interactive SVG pyramid illustrating the Top Notes, Middle/Heart Notes, and Base Notes.
- Hovering over a level expands the tooltip/sidebar displaying note details.

#### [NEW] [components/perfume/AccordBar.tsx](file:///c:/porto/NemuParfang/components/perfume/AccordBar.tsx)
- Custom graphic showing percentages of accords (e.g., Woody 70%, Fresh 30%) with matching luxury tones.

#### [NEW] [app/(main)/explore/page.tsx](file:///c:/porto/NemuParfang/app/(main)/explore/page.tsx)
- Live list of perfumes with query filters (Occasion, Weather, Note, Gender) and Search box.
- Supports side-drawers on mobile, grid configurations on desktop.

#### [NEW] [app/(main)/perfume/[id]/page.tsx](file:///c:/porto/NemuParfang/app/(main)/perfume/[id]/page.tsx)
- Fragrance profile detail view showing:
  - Dual-image thumbnail stack.
  - Scent descriptions and accord levels.
  - Interactive Notes Pyramid.
  - Sillage/Longevity metrics.
  - Similar fragrance recommendations carousel.
  - Sentiment analysis block prepared for future NLP pipeline reviews.

---

### AI Recommendation Engine

#### [NEW] [components/recommendation/MatchForm.tsx](file:///c:/porto/NemuParfang/components/recommendation/MatchForm.tsx)
- Interactive multi-step form quiz:
  - Step 1: Gender preference.
  - Step 2: Preferred fragrance family/vibes (fresh, heavy, sweet, spicy).
  - Step 3: Typical usage occasion.
  - Step 4: Climate/weather condition.
  - Step 5: Notes to avoid.
- Smooth slide transitions between steps.

#### [NEW] [app/(main)/match/page.tsx](file:///c:/porto/NemuParfang/app/(main)/match/page.tsx)
- Quiz layout. When completed, displays a beautiful result screen:
  - User's Fragrance DNA (graphical breakdown).
  - Top 3 perfume recommendations featuring **Match Score Badge (e.g. 96% Match)** and custom reasoning text.
  - Quick option to re-take the quiz.

---

## Verification Plan

### Automated Tests
- Validate TypeScript compliance:
  ```powershell
  npm run build
  ```
- Run ESLint to check for syntax and accessibility warnings:
  ```powershell
  npm run lint
  ```

### Manual Verification
- Deploy local dev server:
  ```powershell
  npm run dev
  ```
- Navigate to `http://localhost:3000` to verify:
  1. Navbar stickiness, drop-down mega menu, and Framer Motion slide-in underline animations.
  2. Hero split image scaling and CTA buttons.
  3. Occasion grid card scaling, chip hover animations.
  4. Explore page filters, sorting, and live search.
  5. Interactive Notes Pyramid hover highlights and tooltips in detail pages.
  6. Match Form quiz steps, progress bars, and the final recommendations result display.
