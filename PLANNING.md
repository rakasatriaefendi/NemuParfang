# NemuParfang — Project Planning

## Deskripsi Proyek

**NemuParfang** adalah platform web berbasis AI untuk eksplorasi, rekomendasi, dan analisis parfum. Pengguna dapat mencari parfum berdasarkan notes, mood, cuaca, dan preferensi personal, lalu mendapatkan rekomendasi cerdas menggunakan machine learning. Platform ini menargetkan komunitas pecinta parfum di Indonesia yang aktif namun belum memiliki tool rekomendasi yang personal dan berbasis data.

---

## Tujuan Proyek

1. **Membangun database parfum** yang terstruktur dan dapat dicari secara advanced.
2. **Mengembangkan sistem rekomendasi AI** berbasis content-based dan collaborative filtering.
3. **Mengintegrasikan fitur ML** seperti mood-to-perfume prediction dan fragrance similarity.
4. **Memberikan pengalaman pengguna personal** melalui auth, koleksi, wishlist, dan review.
5. **Menjadi portfolio AI/ML full-stack** yang kuat dan layak dipresentasikan sebagai skripsi atau startup.

---

## Target Pengguna

- Penggemar parfum pemula yang bingung memilih
- Kolektor parfum yang ingin tracking koleksi
- Orang yang ingin blind buy dan butuh panduan
- Mahasiswa/profesional yang butuh saran parfum sesuai aktivitas

---

## Fase Pengerjaan

### Phase 1 — Foundation (Minggu 1–3)
> Tujuan: Aplikasi bisa berjalan dengan fitur dasar

**Backend & Database**
- [x] Setup project Next.js + Supabase
- [x] Desain skema database (tabel: perfumes, notes, accords, users, reviews, favorites)
- [x] Seed data parfum awal (minimal 50–100 parfum dari dataset publik)
- [x] API endpoint: GET perfumes, GET perfume by ID, GET notes

**Frontend**
- [x] Landing page NemuParfang
- [x] Halaman catalog / browse parfum
- [x] Halaman detail parfum (notes pyramid visual, accords, info lengkap)
- [x] Search bar + filter dasar (disesuaikan dengan field dataset yang tersedia: search, gender, notes/accords)

**Auth**
- [x] Register & login (Supabase Auth)
- [x] Protected routes
- [x] User profile page (minimal)

**Deliverable Phase 1:** User bisa daftar, login, browse parfum, lihat detail, dan filter.

### Status Update Phase 1

- `Done`
  Frontend foundation, auth dasar, protected routes, schema Supabase, image metadata, dan seed dataset penuh sudah selesai. Data katalog di Supabase sekarang lengkap dan sinkron untuk kebutuhan browse, detail, koleksi user, dan fitur recommendation berikutnya.
- `Scope Note`
  Filter foundation mengikuti data nyata yang tersedia pada dataset saat ini. Field seperti `season`, `occasion`, `concentration`, `longevity`, dan `sillage` belum dipaksakan ke UI foundation karena belum punya sumber data yang konsisten.

### Catatan Validasi Seed Final

Validasi akhir terhadap hasil seed penuh menunjukkan bahwa data publik di Supabase sudah lengkap:

- `70103 perfumes`
- `1867 notes`
- `88 accords`
- `437781 perfume_notes`
- `329093 perfume_accords`

Ini berarti schema, relasi many-to-many, image URL parfum, dan proses seed katalog penuh sudah berjalan sesuai rencana untuk foundation phase.

---

### Phase 2 — Social & Personalization (Minggu 4–6)
> Tujuan: Pengguna punya pengalaman personal

**Fitur**
- [x] Tambah parfum ke Favorites / Wishlist
- [x] "Perfume Wardrobe" — koleksi parfum yang dimiliki user
- [x] Review & rating sistem
- [x] Profil publik user (opsional)

**Recommendation System (Rule-Based dulu)**
- [x] Rekomendasi "Similar Perfumes" di halaman detail (berdasarkan shared notes/accords)
- [x] Rekomendasi "You Might Like" di homepage berdasarkan favorites user

**Deliverable Phase 2:** Platform terasa personal dan sosial. User punya koleksi, bisa review, dapat rekomendasi sederhana.

### Status Update Phase 2

- `Done`
  Favorites, wardrobe, review & rating system, profile private/minimal, search/filter catalog yang lebih kuat, recommendation sederhana berbasis shared notes/accords, serta profil publik opt-in dengan kontrol privasi dasar sudah usable tanpa bergantung pada machine learning.
- `Privacy Note`
  Profil publik dibuat opt-in. Email dan wardrobe tetap private, sementara favorites dan reviews hanya tampil jika user memilih untuk membagikannya.
- `Current Position`
  Phase 2 sekarang secara praktis sudah selesai. Langkah berikutnya bisa langsung berpindah ke Phase 3 untuk fitur AI/ML yang lebih besar.

---

### Phase 3 — AI & Machine Learning (Minggu 7–10)
> Tujuan: Diferensiasi utama lewat AI

**ML Features**
- [ ] **Fragrance Similarity Engine** — cosine similarity dari notes/accords vector
- [ ] **AI Perfume Match Predictor** — user isi form (umur, aktivitas, cuaca, style) → ML prediksi parfum cocok (Random Forest / XGBoost)
- [ ] **Mood-to-Perfume AI** — user pilih mood → rekomendasi parfum
- [ ] **Review Sentiment Analysis** — NLP klasifikasi review (positive/negative/neutral + keyword ekstraksi)

**Collaborative Filtering (Opsional, jika data user cukup)**
- [ ] "Orang yang suka parfum ini juga suka…" berdasarkan pola favorites

**Weather Integration (Bonus)**
- [ ] Integrasi OpenWeatherMap API
- [ ] Rekomendasi parfum berdasarkan cuaca saat ini

**Deliverable Phase 3:** AI/ML berjalan dan bisa didemonstrasikan. Ini inti dari nilai proyek.

---

### Phase 4 — Polish & Deployment (Minggu 11–12)
> Tujuan: Produk siap dipresentasikan dan diakses publik

- [ ] UI/UX refinement menyeluruh
- [ ] Optimasi performa (loading, caching)
- [ ] Mobile responsive
- [ ] SEO dasar (meta tags, OG image)
- [ ] Deployment ke Vercel (frontend) + Railway/Render (ML API)
- [ ] Dokumentasi teknis (README, API docs)
- [ ] Demo video / presentasi

---

## Skema Database (Overview)

Bagian ini adalah **schema vision produk**, bukan berarti semua kolom harus langsung tersedia pada fase implementasi awal.
Untuk Phase 1, schema database aktual perlu mengikuti **ketersediaan data yang benar-benar ada di dataset** agar kita tidak menyimpan nilai kosong berlebihan atau, lebih buruk, mengarang atribut yang belum punya sumber data yang valid.

```
perfumes
├── id
├── name
├── brand
├── gender (masculine / feminine / unisex)
├── concentration (EDT / EDP / Parfum / Cologne)
├── year_release
├── longevity (1–5)
├── sillage (1–5)
├── season (spring / summer / fall / winter / all)
├── occasion (office / night / casual / sport / formal)
└── image_url

notes
├── id
├── name
└── category (top / middle / base)

perfume_notes (junction)
├── perfume_id
└── note_id

accords
├── id
└── name (woody / fresh / sweet / oriental / floral…)

perfume_accords (junction)
├── perfume_id
└── accord_id

users
├── id (from Supabase Auth)
├── username
├── avatar_url
└── bio

favorites / wishlist
├── user_id
├── perfume_id
└── type (owned / wishlist)

reviews
├── id
├── user_id
├── perfume_id
├── rating (1–5)
├── content
└── sentiment (hasil ML: positive/negative/neutral)
```

### Catatan Implementasi Phase 1

Schema aktual yang dipakai di Supabase pada Phase 1 mengikuti field yang kuat di dataset saat ini, yaitu:

- `name`
- `brand`
- `country`
- `gender`
- `rating`
- `review_count`
- `year_release`
- `notes_top`, `notes_middle`, `notes_base`
- `main accords`
- `perfumer`
- `source_url`

Karena dataset raw dan cleaned yang digunakan **tidak menyediakan** data yang konsisten untuk `concentration`, `longevity`, `sillage`, `season`, dan `occasion`, maka field-field tersebut **tidak dijadikan kolom inti wajib** pada schema implementasi awal.

Pendekatan ini dipilih agar:

- database tetap jujur terhadap data nyata,
- proses seed lebih bersih dan dapat diaudit,
- frontend tidak bergantung pada atribut yang sebenarnya belum tersedia,
- dan pipeline ML tidak tercampur dengan heuristic yang terlalu agresif.

Dengan kata lain:

- `planning.md` menyimpan **visi schema jangka menengah**
- `schema.sql` menyimpan **schema implementasi realistis untuk Phase 1**

Field seperti `concentration`, `longevity`, `sillage`, `season`, `occasion`, dan `image_url` tetap bisa ditambahkan pada fase berikutnya saat kita sudah memiliki:

- sumber data tambahan,
- enrichment pipeline,
- atau proses manual curation yang cukup andal.

---

## Estimasi Timeline

| Phase | Durasi | Output Utama |
|---|---|---|
| Phase 1 | 3 minggu | Auth + DB + Browse + Detail |
| Phase 2 | 3 minggu | Favorites + Review + Rekomendasi sederhana |
| Phase 3 | 4 minggu | ML features (similarity, predictor, mood, NLP) |
| Phase 4 | 2 minggu | Polish + Deploy + Dokumentasi |
| **Total** | **~12 minggu** | **MVP lengkap siap portfolio** |

---

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Dataset parfum kurang | Kombinasi Kaggle + scraping Fragrantica + input manual |
| ML akurasi rendah | Gunakan similarity cosine dulu, ML predictor sebagai bonus |
| Waktu terbatas | Prioritaskan Phase 1–2, Phase 3 bisa jadi fitur bertahap |
| Cold start problem (collaborative filtering) | Andalkan content-based dulu sampai data user cukup |
