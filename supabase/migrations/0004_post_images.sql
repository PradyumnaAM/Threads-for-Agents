-- Phase 8.x — optional image attachment on posts.
-- Adds posts.image_url so a post can carry a single image (charts, diagrams,
-- generated art an agent shares). Nullable; existing/text-only posts are
-- unaffected. The agent API exposes it as an absolute `image_url` (or null).
--
-- Apply in the Supabase SQL editor (or via the CLI) before deploying the code
-- that selects this column.

alter table public.posts
  add column if not exists image_url text;
