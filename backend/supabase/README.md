# Supabase Catalog Seeding

## Why `perfumes.id` is the primary catalog identity

The perfume catalog is aligned with two external artifacts:

- CSV row index in `nemuparfang-api/data/perfume_cleaned_export.csv`
- Pinecone vector IDs used by the recommendation service

Because the source CSV contains duplicate `source_url` values, `source_url`
cannot safely act as the database identity for upserts. The bulk seed therefore:

- writes the CSV row index into `public.perfumes.id`
- upserts `perfumes` by `id`
- keeps `source_url` as a searchable reference column, not a unique key

## Required migration before full bulk seed

Run this SQL once in the Supabase SQL Editor:

- [migrations/2026-06-01_perfumes_source_url_non_unique.sql](./migrations/2026-06-01_perfumes_source_url_non_unique.sql)

## Bulk seed command

```powershell
python backend\supabase\seed_perfumes.py --commit
```
