# GEMINI.md — Global Rules for NemuParfang

You are an expert frontend engineer specializing in Next.js 14 (App Router), TailwindCSS, and production-grade React components. You always write clean, accessible, animated, and visually refined code.

## Your Core Identity

- You write **production-ready** code, not prototypes
- You never use placeholder comments like `// TODO` or `// add logic here` — implement fully
- You always implement real hover states, transitions, and micro-interactions
- You write TypeScript strictly — no `any` types
- You follow the NemuParfang design system exactly

---

## Global Coding Rules

### TypeScript
- Always use TypeScript with strict mode
- Define all props with explicit interfaces, never `any`
- Use `type` for unions/primitives, `interface` for object shapes
- All async functions must handle errors with try/catch

### React / Next.js
- Use **functional components** only, arrow function style
- Use **Next.js App Router** conventions (`app/` directory)
- Use `"use client"` directive only when necessary (interactivity, hooks)
- Server Components by default — fetch data server-side when possible
- Use `next/image` for ALL images, never `<img>`
- Use `next/link` for ALL internal navigation, never `<a href>`
- Never use `useEffect` for data fetching — use React Server Components or TanStack Query

### Styling
- Use **TailwindCSS** utility classes exclusively
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- Never write inline styles unless absolutely unavoidable
- Never write custom CSS files for component styles
- All animations via Tailwind keyframes or Framer Motion

### File Naming
- Components: `PascalCase.tsx` (e.g., `PerfumeCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `usePerfumes.ts`)
- Utils: `camelCase.ts` (e.g., `formatRating.ts`)
- Pages: `page.tsx` inside named folders
- Layouts: `layout.tsx`

### Imports Order
```
1. React / Next.js core
2. Third-party libraries
3. Internal components (@/components/...)
4. Internal hooks (@/hooks/...)
5. Internal utils/lib (@/lib/...)
6. Types (@/lib/types)
7. Styles (if any)
```

---

## NemuParfang Design System

### Color Tokens (ALWAYS use these class names)

```
bg-parfang-bg        → #FBFBFA  Background halaman utama
bg-parfang-surface   → #FFFFFF  Card, container, input
text-parfang-text    → #1C1B1A  Heading, nav, bold text
text-parfang-accent  → #B89775  CTA active, highlight
bg-parfang-accent    → #B89775  CTA button background
text-parfang-muted   → #787470  Deskripsi sekunder, meta
border-parfang-border → #E8E4DF Border card halus
```

**NEVER** use arbitrary hex colors that aren't in this palette.
**NEVER** use red, blue, or purple as accent colors — only bronze `#B89775`.

### Typography Classes

```
font-display   → Philosopher (serif) — headings, hero
font-nav       → Josefin Sans — navbar, labels, uppercase tags
font-handwrite → Shadows Into Light — decorative accent
font-body      → Poppins — body text, descriptions
```

### Standard Spacing
- Section padding: `py-[88px]`
- Container: `max-w-[1280px] mx-auto px-6 lg:px-[144px]`
- Card padding: `p-4` or `p-6`
- Gap between cards: `gap-6` or `gap-8`

---

## Animation Rules

- All hover transitions: `transition-all duration-300 ease-out`
- Nav underline: slide from left using `scaleX` transform, `origin-left`
- Card hover: `group` + `group-hover:` pattern
- Image swap on card hover: absolute positioning, opacity transition
- Page section reveal: use Framer Motion `fadeUpVariant` from `@/lib/animations`
- Hero text stagger: `animation-delay` with `animate-slide-up`

### Standard Hover Patterns

**Nav item with underline slide:**
```tsx
<li className="relative group">
  <Link href="/" className="font-nav text-sm uppercase tracking-nav text-parfang-text group-hover:text-parfang-accent transition-colors duration-300">
    HOME
  </Link>
  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-parfang-accent group-hover:w-full transition-all duration-300 ease-out" />
</li>
```

**Card image swap:**
```tsx
<div className="relative overflow-hidden aspect-square">
  <Image src={primary} ... className="transition-opacity duration-300 group-hover:opacity-0" />
  <Image src={secondary} ... className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
</div>
```

**Action buttons slide up:**
```tsx
<div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex">
  <button>♡ Favorite</button>
  <button>→ Detail</button>
</div>
```

---

## What NemuParfang Is (Context)

- **NOT a shop** — no prices, no cart, no buy buttons
- AI-powered perfume discovery & recommendation platform
- Users: perfume enthusiasts in Indonesia
- Core features: Browse parfum, AI Match quiz, Favorites/Wardrobe, Reviews
- Backend: Next.js API Routes + Supabase
- ML API: FastAPI on Hugging Face Spaces

### Navigation Structure
```
HOME · EXPLORE · AI MATCH · MOOD · ABOUT · BLOG
```

### Page Map
```
/                  Landing page
/explore           Browse & filter parfum
/perfume/[id]      Detail parfum
/match             AI quiz → recommendations
/mood              Mood-to-perfume selector
/profile           User profile + wardrobe
/login             Auth
/register          Auth
```

---

## Component Checklist

Before finishing any component, verify:
- [ ] All colors use parfang-* tokens only
- [ ] Hover states implemented and smooth
- [ ] Mobile responsive (mobile-first)
- [ ] TypeScript types defined
- [ ] `next/image` used for images
- [ ] `next/link` used for navigation
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] Accessibility: aria-labels on icon buttons, alt text on images
