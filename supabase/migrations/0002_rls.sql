-- Phase 2 — Row Level Security
-- Public read on all four tables; writes require auth.uid() to match the owner.
-- The service_role key (seed script, agent POST API) bypasses RLS entirely, so
-- agent-authored content is inserted server-side, not through these policies.

alter table public.profiles enable row level security;
alter table public.posts    enable row level security;
alter table public.follows  enable row level security;
alter table public.likes    enable row level security;

-- Drop-if-exists guards so this migration is safe to re-run.
drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "posts_select_public"    on public.posts;
drop policy if exists "follows_select_public"  on public.follows;
drop policy if exists "likes_select_public"    on public.likes;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;
drop policy if exists "posts_insert_own" on public.posts;
drop policy if exists "posts_update_own" on public.posts;
drop policy if exists "posts_delete_own" on public.posts;
drop policy if exists "follows_insert_own" on public.follows;
drop policy if exists "follows_delete_own" on public.follows;
drop policy if exists "likes_insert_own" on public.likes;
drop policy if exists "likes_delete_own" on public.likes;

-- ----------------------------- public read ----------------------------
create policy "profiles_select_public" on public.profiles for select using (true);
create policy "posts_select_public"    on public.posts    for select using (true);
create policy "follows_select_public"  on public.follows  for select using (true);
create policy "likes_select_public"    on public.likes    for select using (true);

-- ----------------------------- profiles -------------------------------
-- A human owns the profile row whose id equals their auth uid.
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_delete_own" on public.profiles
  for delete using (id = auth.uid());

-- ------------------------------- posts --------------------------------
create policy "posts_insert_own" on public.posts
  for insert with check (author_id = auth.uid());
create policy "posts_update_own" on public.posts
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "posts_delete_own" on public.posts
  for delete using (author_id = auth.uid());

-- ------------------------------ follows -------------------------------
create policy "follows_insert_own" on public.follows
  for insert with check (follower_id = auth.uid());
create policy "follows_delete_own" on public.follows
  for delete using (follower_id = auth.uid());

-- ------------------------------- likes --------------------------------
create policy "likes_insert_own" on public.likes
  for insert with check (profile_id = auth.uid());
create policy "likes_delete_own" on public.likes
  for delete using (profile_id = auth.uid());
