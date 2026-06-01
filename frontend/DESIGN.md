# NemuParfang — Design System

> *"Skip the sniff, just click and pick!"*
> Platform rekomendasi parfum AI yang elegan, gender-neutral, dan minimalis.

---

## 1. Brand Identity

| Atribut | Nilai |
|---|---|
| **Nama** | NemuParfang |
| **Tagline** | Skip the sniff, just click and pick! |
| **Persona** | Elegan · Minimalis · Trustworthy · Gender-Neutral |
| **Inspirasi Visual** | Perfomy theme — struktur layout & animasi hover |
| **Diferensiasi** | AI-powered, bukan toko. No shop, no cart. Pure discovery. |

---

## 2. Color Palette

### Token Warna Resmi

```js
// tailwind.config.js — objek colors
colors: {
  'parfang-bg':      '#FBFBFA', // Alabaster Sand  — BG utama halaman (60%)
  'parfang-surface': '#FFFFFF', // Pure White      — Card, container, input (20%)
  'parfang-text':    '#1C1B1A', // Deep Espresso   — Heading, nav, bold text (15%)
  'parfang-accent':  '#B89775', // Luxury Bronze   — CTA, badge aktif, highlight (5%)
  'parfang-muted':   '#787470', // Muted Stone     — Deskripsi, border, sub-notes
},
```

### Penggunaan Warna

| Token | Hex | Peran | Porsi |
|---|---|---|---|
| `parfang-bg` | `#FBFBFA` | Background utama seluruh halaman | 60% |
| `parfang-surface` | `#FFFFFF` | Card parfum, container, input kuis AI | 20% |
| `parfang-text` | `#1C1B1A` | Heading, nav, tombol teks, teks tebal | 15% |
| `parfang-accent` | `#B89775` | CTA "Mulai Kuis AI", badge aktif, border highlight | 5% |
| `parfang-muted` | `#787470` | Sub-notes, deskripsi sekunder, border halus | — |

### Extended Palette (Turunan)

```css
/* CSS Variables — tambahkan di globals.css */
:root {
  --parfang-bg:           #FBFBFA;
  --parfang-surface:      #FFFFFF;
  --parfang-text:         #1C1B1A;
  --parfang-accent:       #B89775;
  --parfang-accent-light: #D4B896;  /* hover state CTA */
  --parfang-accent-dark:  #9A7D5E;  /* pressed state CTA */
  --parfang-muted:        #787470;
  --parfang-border:       #E8E4DF;  /* border halus card */
  --parfang-overlay:      rgba(28, 27, 26, 0.55); /* overlay hero/dark section */
}
```

---

## 3. Typography

### Font Stack

```js
// tailwind.config.js — fontFamily
fontFamily: {
  'display':  ['Philosopher', 'Georgia', 'serif'],       // Heading besar, hero
  'nav':      ['"Josefin Sans"', 'sans-serif'],           // Navbar, label, badge
  'handwrite':['Shadows Into Light', 'cursive'],         // Accent text, tagline
  'body':     ['Poppins', 'system-ui', 'sans-serif'],    // Body, deskripsi
},
```

### Type Scale

| Level | Font | Size | Weight | Penggunaan |
|---|---|---|---|---|
| `display-xl` | Philosopher | 72–90px | 700 | Hero headline "NEW TRENDING" |
| `display-lg` | Philosopher | 48–60px | 700 | Section title |
| `display-md` | Philosopher | 30–36px | 400 | Sub-heading |
| `nav` | Josefin Sans | 14px | 600 | Menu navbar, uppercase, spaced |
| `accent` | Shadows Into Light | 36–60px | 400 | "Fashion Style", tagline dekoratif |
| `label` | Josefin Sans | 11–13px | 700 | Badge, tag, kategori |
| `body` | Poppins | 14–16px | 400–500 | Deskripsi, content |
| `caption` | Poppins | 12px | 400 | Sub-notes parfum, meta info |

### Google Fonts Import

```html
<!-- Di _document.tsx atau layout.tsx -->
<link
  href="https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Josefin+Sans:wght@400;600;700&family=Shadows+Into+Light&family=Poppins:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
```

---

## 4. Spacing & Layout

```js
// Tailwind extend spacing
spacing: {
  'section': '88px',   // Jarak antar section besar
  'section-sm': '48px',
  'container-pad': '144px', // Padding container desktop
}
```

### Breakpoints (Default Tailwind, diikuti)

| Nama | Width | Penggunaan |
|---|---|---|
| `sm` | 640px | Mobile large |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop kecil |
| `xl` | 1280px | Desktop standar |
| `2xl` | 1536px | Desktop besar |

---

## 5. Component Specs

### 5.1 Navbar

**Struktur:** 3-layer (top bar tipis → logo center → nav menu bawah)

```
[top bar]  My Account | WishList | Login                  [lang]
[center]   [Search]         NEMUPARFANG         [Profile Icon]
[nav]      HOME · EXPLORE · AI MATCH · MOOD · ABOUT · BLOG
```

**Behavior:**
- Sticky on scroll → background blur `backdrop-blur-sm` + shadow muncul
- Nav item hover: teks berubah dari `parfang-text` → `parfang-accent`, garis bawah **slide-in dari kiri** (width 0 → 100%, transition 300ms ease)
- Active item: garis bawah permanen berwarna `parfang-accent`
- Logo: `font-display text-2xl tracking-widest uppercase`
- Nav items: `font-nav text-sm uppercase tracking-[0.15em]`

**Mega Menu (untuk Explore):**
- Dropdown dengan image preview per kategori (Woody, Fresh, Floral, Oriental)
- Grid 4 kolom dengan gambar di atas, link di bawah

### 5.2 Hero Section

**Layout:** Fullwidth split — kiri foto model/parfum, kanan teks overlay

**Animasi (staggered):**
```
delay-100ms: "Fashion Style" (Shadows Into Light, fade + slideX)
delay-1000ms: "NEW" (Philosopher bold, fade-in)
delay-2000ms: "TRENDING" (Philosopher, fade-in)
delay-3000ms: "COLLECTION" badge merah → ganti: badge #B89775
delay-4000ms: "Mulai Kuis AI" button (fade-in)
```

**Warna adaptasi dari Perfomy:**
- Badge "COLLECTION": ganti `#D45351` → `parfang-accent #B89775`
- Teks hero: tetap `#FFFFFF` di atas overlay gelap

### 5.3 Perfume Card

**States:**
- **Default:** White surface, border `parfang-border`, shadow tipis
- **Hover:** Image swap ke secondary image (fade 300ms), action buttons muncul dari bawah (translateY slide-up), subtle shadow intensify

**Struktur card:**
```
[image area]         ← aspect-ratio 1:1, object-cover
  [hover overlay]   ← action buttons: ♡ Favorit | 👁 Detail
[content area]
  [name]            ← font-body font-medium text-parfang-text
  [brand]           ← font-nav text-xs text-parfang-muted uppercase
  [accord tags]     ← badge kecil: Woody · Fresh · Amber
  [rating]          ← bintang accent + review count muted
  [match score]     ← "94% Match" badge parfang-accent (khusus AI result)
```

### 5.4 Notes Pyramid (Fitur Kunci)

**Visual:** SVG pyramid interaktif, 3 level

```
        ▲
      [TOP]          ← Citrus, Bergamot
    [MIDDLE]         ← Lavender, Cinnamon
   [BASE]            ← Amber, Musk, Vanilla
```

**Behavior:**
- Hover per layer → highlight + tooltip muncul dengan nama notes
- Animasi: layer muncul satu per satu dari bawah ke atas (staggered)
- Warna: gradient dari `parfang-muted` (base) → `parfang-accent` (top)

### 5.5 CTA Button

```tsx
// Tiga varian button
Primary:   bg-parfang-accent text-white hover:bg-[#9A7D5E]
Secondary: border border-parfang-accent text-parfang-accent hover:bg-parfang-accent hover:text-white
Ghost:     text-parfang-muted hover:text-parfang-text underline-offset-4 hover:underline
```

**Hover transition:** `transition-all duration-300 ease-out`

### 5.6 Accord Tags / Badges

```tsx
// Accord tag
<span className="px-2 py-0.5 text-[11px] font-nav uppercase tracking-wider
  border border-parfang-border text-parfang-muted
  hover:border-parfang-accent hover:text-parfang-accent
  transition-colors duration-200 cursor-default">
  Woody
</span>
```

### 5.7 AI Match Form (Mood Selector)

**Layout:** Step-by-step quiz, satu pertanyaan per layar

**Style:**
- Background: `parfang-bg`
- Option cards: `parfang-surface` border, hover → `parfang-accent` border + subtle glow
- Progress bar: `parfang-accent` fill, `parfang-border` track
- CTA final: "Temukan Parfumku" → large primary button

---

## 6. Animation System

### Prinsip Animasi

| Properti | Nilai |
|---|---|
| **Easing default** | `ease-out` (Power3) |
| **Duration fast** | 200–300ms (hover, badge) |
| **Duration medium** | 500–800ms (slide, reveal) |
| **Duration slow** | 1000ms+ (hero stagger) |
| **Filosofi** | Subtle, tidak mengganggu. Animasi terasa seperti **nafas**, bukan atraksi. |

### Animation Tokens (Tailwind extend)

```js
// tailwind.config.js
animation: {
  'fade-in':     'fadeIn 0.6s ease-out forwards',
  'slide-up':    'slideUp 0.5s ease-out forwards',
  'slide-left':  'slideLeft 0.5s ease-out forwards',
  'underline-in':'underlineIn 0.3s ease-out forwards',
},
keyframes: {
  fadeIn:      { from: { opacity: '0' }, to: { opacity: '1' } },
  slideUp:     { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
  slideLeft:   { from: { opacity: '0', transform: 'translateX(-30px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
  underlineIn: { from: { width: '0%' }, to: { width: '100%' } },
},
```

### Framer Motion Variants (untuk Next.js)

```ts
// lib/animations.ts
export const fadeUpVariant = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export const navUnderline = {
  rest:  { width: '0%' },
  hover: { width: '100%', transition: { duration: 0.3, ease: 'easeOut' } },
}
```

---

## 7. Adaptasi dari Perfomy Theme

### Yang Diambil (Struktur & Animasi)

| Elemen Perfomy | Adaptasi NemuParfang |
|---|---|
| 3-layer header | ✅ Dipertahankan — top bar, center logo, bottom nav |
| Nav underline slide-in | ✅ Dipertahankan — ganti warna merah → `parfang-accent` |
| Nav teks hover putih→merah | ✅ Dipertahankan — ganti merah → `parfang-accent` |
| Hero split layout (foto + teks) | ✅ Dipertahankan |
| Staggered hero text animation | ✅ Dipertahankan — dikurangi durasi |
| Product card dual-image hover | ✅ Dipertahankan — kartu parfum |
| Mega menu dengan image preview | ✅ Dipertahankan — untuk menu Explore |
| Scroll-triggered section reveal | ✅ Dipertahankan |
| Full-width parallax section | ✅ Dipertahankan — AI Match CTA section |
| Brand logo carousel | ✅ Dipertahankan — brand parfum (Dior, YSL, etc.) |

### Yang Dihilangkan

| Elemen Perfomy | Alasan |
|---|---|
| Halaman Shop / Add to Cart | NemuParfang bukan toko |
| Wishlist / Checkout | Ganti dengan Favorites & Wardrobe |
| Harga produk pada card | Diganti Match Score & Notes |
| Currency switcher | Tidak relevan |
| Instagram feed | Opsional, masuk Phase 4 |
| Newsletter popup | Masuk Phase 2 |

### Yang Ditambahkan (NemuParfang Exclusive)

| Fitur Baru | Deskripsi |
|---|---|
| Notes Pyramid visual | Interaktif, SVG animated, per parfum |
| Accord tag pills | Filter dan display di card |
| AI Match Score badge | "94% Match" khusus hasil AI |
| Mood Selector UI | Step-by-step quiz visual |
| Fragrance DNA profile | Profil aroma user (woody 70%, citrus 20%) |
| Longevity & Sillage bar | Visual bar di detail parfum |

---

## 8. Page Structure Map

```
/                    → Landing Page (Hero + Trending + AI Promo + Blog)
/explore             → Browse & Filter Parfum
/perfume/[id]        → Detail Parfum (notes pyramid, accords, reviews, similar)
/match               → AI Perfume Match (quiz form → results)
/mood                → Mood-to-Perfume selector
/profile             → User profile, wardrobe, favorites
/login               → Auth page
/register            → Register page
/about               → About NemuParfang
```

---

## 9. Tailwind Config Lengkap

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'parfang-bg':      '#FBFBFA',
        'parfang-surface': '#FFFFFF',
        'parfang-text':    '#1C1B1A',
        'parfang-accent':  '#B89775',
        'parfang-accent-light': '#D4B896',
        'parfang-accent-dark':  '#9A7D5E',
        'parfang-muted':   '#787470',
        'parfang-border':  '#E8E4DF',
        'parfang-overlay': 'rgba(28,27,26,0.55)',
      },
      fontFamily: {
        'display':   ['Philosopher', 'Georgia', 'serif'],
        'nav':       ['"Josefin Sans"', 'sans-serif'],
        'handwrite': ['"Shadows Into Light"', 'cursive'],
        'body':      ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.6s ease-out forwards',
        'slide-up':   'slideUp 0.5s ease-out forwards',
        'slide-left': 'slideLeft 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideLeft: { from: { opacity: '0', transform: 'translateX(-30px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
      letterSpacing: {
        'nav': '0.15em',
        'wide-xl': '0.25em',
      },
    },
  },
  plugins: [],
}
```
