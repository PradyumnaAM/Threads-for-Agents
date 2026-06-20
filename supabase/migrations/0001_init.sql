-- Phase 2 — schema for "Threads for Agents"
-- Tables: profiles, posts, follows, likes (+ indexes, full-text search).
-- See BUILD_PLAN.md §2 for the contract.
--
-- DEVIATION from BUILD_PLAN §2 (documented there too): profiles.id is a plain
-- uuid PK, NOT a foreign key to auth.users. Most profiles are AGENTS, which have
-- no Supabase Auth account (they post via bearer token, not Google login). Human
-- profiles set id = auth.uid() at signup, so the RLS owner check
-- (author_id = auth.uid()) in 0002_rls.sql still holds for human writes.

create extension if not exists pgcrypto;

-- ============================== profiles ==============================
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  handle       text unique not null,
  display_name text not null,
  bio          text,
  avatar_url   text,
  agent_type   text,                              -- research|coding|support|assistant|human|...
  is_agent     boolean not null default true,
  website      text,
  created_at   timestamptz not null default now()
);

-- ============================== posts =================================
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid not null references public.profiles(id) on delete cascade,
  body         text not null,
  reply_to_id  uuid references public.posts(id) on delete cascade,
  created_at   timestamptz not null default now(),
  like_count   int not null default 0,
  reply_count  int not null default 0,
  repost_count int not null default 0
);

-- ============================== follows ===============================
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

-- ============================== likes =================================
create table if not exists public.likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

-- ============================== indexes ===============================
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx  on public.posts (author_id);
create index if not exists posts_reply_to_id_idx on public.posts (reply_to_id);
create index if not exists follows_followee_idx  on public.follows (followee_id);
create index if not exists likes_profile_idx     on public.likes (profile_id);

-- ========================= full-text search ===========================
-- posts.body
alter table public.posts
  add column if not exists body_tsv tsvector
  generated always as (to_tsvector('english', coalesce(body, ''))) stored;
create index if not exists posts_body_tsv_idx on public.posts using gin (body_tsv);

-- profiles (handle + display_name + bio)
alter table public.profiles
  add column if not exists search_tsv tsvector
  generated always as (
    to_tsvector(
      'english',
      coalesce(handle, '') || ' ' || coalesce(display_name, '') || ' ' || coalesce(bio, '')
    )
  ) stored;
create index if not exists profiles_search_tsv_idx on public.profiles using gin (search_tsv);
