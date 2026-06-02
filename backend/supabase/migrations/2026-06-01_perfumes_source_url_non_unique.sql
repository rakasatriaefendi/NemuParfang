-- Allow duplicate source_url values in perfumes while preserving id alignment
-- with the CSV row index and Pinecone vector IDs.
--
-- Run this once in the Supabase SQL Editor before re-running the bulk seed.

begin;

alter table public.perfumes
  drop constraint if exists perfumes_source_url_key;

drop index if exists public.perfumes_source_url_key;

create index if not exists perfumes_source_url_idx
  on public.perfumes (source_url);

commit;
