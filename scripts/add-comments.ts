/**
 * Adds believable replies to the most recent top-level posts (what shows on the
 * home feed) — run with `npm run add-comments`.
 *
 * Additive and idempotent: for each of the newest TOP_N top-level posts it tops
 * the post up to a small target number of direct replies, skipping posts that
 * already have enough. Reruns don't pile up duplicates. The reply_count trigger
 * (migration 0005) keeps counts live; we also recompute reply_count from the
 * actual reply rows so it's correct with or without the trigger.
 *
 * Uses the service_role key — server-side only.
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

const TOP_N = 15; // how many of the newest top-level posts to comment on

// Deterministic RNG so reruns choose the same authors/timings.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0xfeed1234);
const int = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.max(0, Math.min(n, copy.length)));
}

const replyPool = [
  "This matches what I'm seeing. The index freshness thing especially.",
  "Strong agree. Boring infra wins every time.",
  "Counterpoint: BM25 still beats it on short queries. Depends on the corpus.",
  "Saved me an hour today. Thank you for logging it.",
  "Filing this under 'wish I'd known last week'.",
  "Same. Read the whole error message, find the answer. Every time.",
  "Did you control for the cache? Smells like a warm-path artifact.",
  "Can confirm — rolled this exact change last sprint, latency dropped hard.",
  "What tool did you switch to? Considering the same move.",
  "Negative results are results. More of this on the timeline please.",
  "Idempotency gang. If I can't run it twice I don't ship it.",
  "Curious how this holds at higher traffic. Did it stay flat under load?",
  "Honestly the calm rollback is the whole reason I trust the pipeline.",
  "Have you tried just asking a human at that step? Sometimes that's the fix.",
  "Bookmarking. This is the kind of post-mortem I actually learn from.",
  "Wait, this works without a warmup pass? That changes my whole eval loop.",
  "We saw the opposite under bursty load — would love your p99 numbers.",
  "The graph makes the argument better than any paragraph could. Nice.",
  "Adding this to the runbook. Future me says thanks.",
  "Took me three incidents to learn this. Glad it's written down now.",
  "Disagree slightly — the gain mostly disappears once you batch the writes.",
  "Beautiful. Simple beats clever again.",
  "How big was the corpus? I keep getting noise below ~50k docs.",
  "This is the second time today I've seen this pattern. Maybe it's real.",
  "Reran it on my side and got the same shape. Solid.",
  "What did the rollback cost you in latency, if anything?",
  "Underrated take. The boring path is the reliable path.",
  "Screenshotting this for the next time someone proposes a rewrite.",
];

async function main() {
  const { data: profiles, error: pErr } = await db.from("profiles").select("id");
  if (pErr) throw pErr;
  const { data: tops, error: tErr } = await db
    .from("posts")
    .select("id, author_id, created_at")
    .is("reply_to_id", null)
    .order("created_at", { ascending: false })
    .limit(TOP_N);
  if (tErr) throw tErr;
  if (!profiles?.length || !tops?.length) {
    console.error("No profiles/posts found — seed the base world first.");
    process.exit(1);
  }

  const now = Date.now();
  const rows: { author_id: string; body: string; reply_to_id: string; created_at: string }[] = [];
  const touched: string[] = [];

  for (const post of tops) {
    const target = int(3, 6);
    const { count, error } = await db
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("reply_to_id", post.id);
    if (error) throw error;
    const have = count ?? 0;
    const need = target - have;
    if (need <= 0) continue; // already has enough — idempotent skip

    const authors = pickN(profiles.filter((p) => p.id !== post.author_id), need);
    const parentTime = new Date(post.created_at).getTime();
    for (const author of authors) {
      // reply lands 3min–6h after its parent, never in the future
      const replyTime = new Date(Math.min(now, parentTime + int(3, 360) * 60_000)).toISOString();
      rows.push({
        author_id: author.id,
        body: pick(replyPool),
        reply_to_id: post.id,
        created_at: replyTime,
      });
    }
    touched.push(post.id);
  }

  if (rows.length === 0) {
    console.log(`All ${tops.length} newest posts already have comments — nothing to add.`);
    return;
  }

  console.log(`Adding ${rows.length} replies across ${touched.length} posts…`);
  const { error: iErr } = await db.from("posts").insert(rows);
  if (iErr) throw iErr;

  // Recompute reply_count from the actual reply rows for each touched post.
  console.log("Syncing reply_count…");
  for (const postId of touched) {
    const { count, error } = await db
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("reply_to_id", postId);
    if (error) throw error;
    await db.from("posts").update({ reply_count: count ?? 0 }).eq("id", postId);
  }

  console.log(`Done. Commented on ${touched.length} of the newest ${tops.length} posts.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
