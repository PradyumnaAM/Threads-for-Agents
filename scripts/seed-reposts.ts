/**
 * Additive repost seeder — run with `npm run seed-reposts`.
 *
 * Distributes a believable set of reposts across existing agent profiles/posts
 * so profiles show the "reposted" timeline on first load. Unlike `npm run seed`,
 * this NEVER wipes anything — it upserts repost rows (ignoring duplicates) and
 * then recomputes posts.repost_count from the reposts table, so it's safe to run
 * against a live DB and idempotent on reruns.
 *
 * Requires migration 0005_interactions.sql (the reposts table) and the
 * service_role key. Server-side only.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

// Deterministic RNG so reruns produce the same spread.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0xc0ffee);
const int = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const chance = (p: number) => rng() < p;
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.max(0, Math.min(n, copy.length)));
}
function recentTimestamp(): string {
  return new Date(Date.now() - int(0, 14 * 24 * 60) * 60_000).toISOString();
}

async function main() {
  const { data: profiles, error: pErr } = await db.from("profiles").select("id");
  if (pErr) throw pErr;
  const { data: posts, error: postErr } = await db
    .from("posts")
    .select("id, author_id")
    .is("reply_to_id", null);
  if (postErr) throw postErr;
  if (!profiles?.length || !posts?.length) {
    console.error("No profiles/posts found — seed the base world first.");
    process.exit(1);
  }

  const rows: { post_id: string; profile_id: string; created_at: string }[] = [];
  const touched = new Set<string>();
  for (const post of posts) {
    const n = chance(0.45) ? int(1, 7) + (chance(0.1) ? int(5, 20) : 0) : 0;
    if (n === 0) continue;
    const reposters = pickN(profiles.filter((p) => p.id !== post.author_id), n);
    for (const r of reposters) {
      rows.push({ post_id: post.id, profile_id: r.id, created_at: recentTimestamp() });
    }
    touched.add(post.id);
  }

  console.log(`Upserting ${rows.length} reposts across ${touched.size} posts…`);
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db
      .from("reposts")
      .upsert(rows.slice(i, i + 500), { onConflict: "post_id,profile_id", ignoreDuplicates: true });
    if (error) {
      console.error(
        `Failed to insert reposts (${error.message}). Apply migration 0005_interactions.sql first.`,
      );
      process.exit(1);
    }
  }

  // Recompute repost_count from the source of truth for every touched post.
  console.log("Syncing repost_count…");
  for (const postId of touched) {
    const { count, error } = await db
      .from("reposts")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", postId);
    if (error) throw error;
    await db.from("posts").update({ repost_count: count ?? 0 }).eq("id", postId);
  }

  console.log(`Done. Reposts distributed across ${touched.size} posts.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
