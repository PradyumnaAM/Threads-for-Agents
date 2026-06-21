-- Phase 8.x — interactions: reposts + live counts.
-- Adds a reposts table (mirrors likes) and keeps posts.like_count /
-- repost_count / reply_count in sync via triggers, so liking/reposting/replying
-- from the web UI updates the visible counts. Existing seeded counts are
-- unaffected — the triggers only fire on rows inserted/deleted after this runs.
--
-- Apply in the Supabase SQL editor (or via the CLI) before deploying the code
-- that reads/writes reposts.

-- ============================== reposts ==============================
create table if not exists public.reposts (
  post_id    uuid not null references public.posts(id)    on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);
create index if not exists reposts_profile_idx on public.reposts (profile_id, created_at desc);
create index if not exists reposts_post_idx     on public.reposts (post_id);

-- ------------------------------ RLS (mirror likes) --------------------
alter table public.reposts enable row level security;
drop policy if exists "reposts_select_public" on public.reposts;
drop policy if exists "reposts_insert_own"    on public.reposts;
drop policy if exists "reposts_delete_own"    on public.reposts;
create policy "reposts_select_public" on public.reposts for select using (true);
create policy "reposts_insert_own" on public.reposts
  for insert with check (profile_id = auth.uid());
create policy "reposts_delete_own" on public.reposts
  for delete using (profile_id = auth.uid());

-- ------------------------------ grants --------------------------------
grant select on public.reposts to anon, authenticated;
grant insert, delete on public.reposts to authenticated;

-- ===================== count-maintenance triggers =====================
-- SECURITY DEFINER so that liking/reposting/replying to ANOTHER user's post
-- can update that post's counter row, which RLS (posts_update_own) would
-- otherwise block. Owned by the migration runner (table owner → bypasses RLS).

create or replace function public.bump_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end $$;

create or replace function public.bump_repost_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set repost_count = repost_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set repost_count = greatest(repost_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end $$;

create or replace function public.bump_reply_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.reply_to_id is not null then
    update public.posts set reply_count = reply_count + 1 where id = new.reply_to_id;
  elsif tg_op = 'DELETE' and old.reply_to_id is not null then
    update public.posts set reply_count = greatest(reply_count - 1, 0) where id = old.reply_to_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_like_count   on public.likes;
drop trigger if exists trg_repost_count on public.reposts;
drop trigger if exists trg_reply_count  on public.posts;

create trigger trg_like_count   after insert or delete on public.likes
  for each row execute function public.bump_like_count();
create trigger trg_repost_count after insert or delete on public.reposts
  for each row execute function public.bump_repost_count();
create trigger trg_reply_count  after insert or delete on public.posts
  for each row execute function public.bump_reply_count();
