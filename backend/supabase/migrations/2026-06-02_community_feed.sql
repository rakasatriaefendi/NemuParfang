-- Community feed MVP: posts, likes, reposts, comments, and storage bucket.
-- Run this once in the Supabase SQL Editor Test.

begin;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null,
  author_username text,
  author_avatar_url text,
  content text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (content is not null and char_length(trim(content)) between 1 and 2000)
    or image_url is not null
  )
);

create table if not exists public.community_post_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.community_post_reposts (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null,
  author_username text,
  author_avatar_url text,
  content text not null check (char_length(trim(content)) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_post_comments_post_id_idx on public.community_post_comments (post_id);

drop trigger if exists community_posts_set_updated_at on public.community_posts;
create trigger community_posts_set_updated_at
before update on public.community_posts
for each row execute function public.set_updated_at();

drop trigger if exists community_post_comments_set_updated_at on public.community_post_comments;
create trigger community_post_comments_set_updated_at
before update on public.community_post_comments
for each row execute function public.set_updated_at();

alter table public.community_posts enable row level security;
alter table public.community_post_likes enable row level security;
alter table public.community_post_reposts enable row level security;
alter table public.community_post_comments enable row level security;

drop policy if exists "Public can read community posts" on public.community_posts;
create policy "Public can read community posts"
on public.community_posts for select
using (true);

drop policy if exists "Users can create their own community posts" on public.community_posts;
create policy "Users can create their own community posts"
on public.community_posts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own community posts" on public.community_posts;
create policy "Users can update their own community posts"
on public.community_posts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own community posts" on public.community_posts;
create policy "Users can delete their own community posts"
on public.community_posts for delete
using (auth.uid() = user_id);

drop policy if exists "Public can read community likes" on public.community_post_likes;
create policy "Public can read community likes"
on public.community_post_likes for select
using (true);

drop policy if exists "Users can like posts" on public.community_post_likes;
create policy "Users can like posts"
on public.community_post_likes for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can unlike their own likes" on public.community_post_likes;
create policy "Users can unlike their own likes"
on public.community_post_likes for delete
using (auth.uid() = user_id);

drop policy if exists "Public can read community reposts" on public.community_post_reposts;
create policy "Public can read community reposts"
on public.community_post_reposts for select
using (true);

drop policy if exists "Users can repost posts" on public.community_post_reposts;
create policy "Users can repost posts"
on public.community_post_reposts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can remove their reposts" on public.community_post_reposts;
create policy "Users can remove their reposts"
on public.community_post_reposts for delete
using (auth.uid() = user_id);

drop policy if exists "Public can read community comments" on public.community_post_comments;
create policy "Public can read community comments"
on public.community_post_comments for select
using (true);

drop policy if exists "Users can create their own community comments" on public.community_post_comments;
create policy "Users can create their own community comments"
on public.community_post_comments for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own community comments" on public.community_post_comments;
create policy "Users can update their own community comments"
on public.community_post_comments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own community comments" on public.community_post_comments;
create policy "Users can delete their own community comments"
on public.community_post_comments for delete
using (auth.uid() = user_id);

grant select on public.community_posts, public.community_post_likes, public.community_post_reposts, public.community_post_comments to anon, authenticated;
grant insert, update, delete on public.community_posts, public.community_post_comments to authenticated;
grant insert, delete on public.community_post_likes, public.community_post_reposts to authenticated;

insert into storage.buckets (id, name, public)
values ('community-media', 'community-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view community media" on storage.objects;
create policy "Public can view community media"
on storage.objects for select
using (bucket_id = 'community-media');

drop policy if exists "Authenticated users can upload community media" on storage.objects;
create policy "Authenticated users can upload community media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'community-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Authenticated users can delete their community media" on storage.objects;
create policy "Authenticated users can delete their community media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'community-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

commit;
