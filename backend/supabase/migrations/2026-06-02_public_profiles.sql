-- Add opt-in public profile controls and public favorite visibility.
-- Run this once in the Supabase SQL Editor.

begin;

alter table public.profiles
  add column if not exists is_public boolean not null default false,
  add column if not exists show_favorites boolean not null default true,
  add column if not exists show_reviews boolean not null default true;

drop policy if exists "Public can read opted-in profiles" on public.profiles;
create policy "Public can read opted-in profiles"
on public.profiles for select
using (is_public = true);

drop policy if exists "Public can read opted-in favorite collections" on public.user_perfumes;
create policy "Public can read opted-in favorite collections"
on public.user_perfumes for select
using (
  collection_type = 'favorite'
  and exists (
    select 1
    from public.profiles
    where profiles.id = user_perfumes.user_id
      and profiles.is_public = true
      and profiles.show_favorites = true
  )
);

grant select on public.profiles to anon;
grant select on public.user_perfumes to anon;

commit;
