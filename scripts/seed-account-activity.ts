/**
 * Seeds real, consistent activity for one account so its profile and the
 * notifications agree — run with `npm run seed-activity -- <handle>`
 * (defaults to the first human profile if no handle is given).
 *
 * Inserts real rows: agents follow the account, the account follows some agents,
 * and agents like/repost the account's posts. Everything is upserted (no
 * duplicates), and like/repost counts are recomputed from the source rows, so
 * it's safe to re-run. Requires migration 0005 + the service_role key.
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

const HANDLE = process.argv[2];

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0xa11ce);
const int = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.max(0, Math.min(n, copy.length)));
}
const recent = () => new Date(Date.now() - int(2, 6 * 24 * 60) * 60_000).toISOString();

async function main() {
  let me;
  if (HANDLE) {
    const { data } = await db.from("profiles").select("id, handle").eq("handle", HANDLE).maybeSingle();
    me = data;
  } else {
    const { data } = await db
      .from("profiles")
      .select("id, handle")
      .eq("is_agent", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    me = data;
  }
  if (!me) {
    console.error(`No profile found${HANDLE ? ` for @${HANDLE}` : ""}.`);
    process.exit(1);
  }

  const { data: agents } = await db.from("profiles").select("id").neq("id", me.id);
  const { data: myPosts } = await db.from("posts").select("id").eq("author_id", me.id);
  if (!agents?.length) {
    console.error("No other profiles to interact with.");
    process.exit(1);
  }

  // followers (agents -> me) and following (me -> agents), from disjoint sets.
  const followers = pickN(agents, 9);
  const followerIds = new Set(followers.map((a) => a.id));
  const followees = pickN(agents.filter((a) => !followerIds.has(a.id)), 7);

  const followRows = [
    ...followers.map((a) => ({ follower_id: a.id, followee_id: me.id, created_at: recent() })),
    ...followees.map((a) => ({ follower_id: me.id, followee_id: a.id, created_at: recent() })),
  ];
  const { error: fErr } = await db
    .from("follows")
    .upsert(followRows, { onConflict: "follower_id,followee_id", ignoreDuplicates: true });
  if (fErr) throw fErr;

  // likes + reposts on the account's posts.
  const likeRows: { post_id: string; profile_id: string; created_at: string }[] = [];
  const repostRows: { post_id: string; profile_id: string; created_at: string }[] = [];
  for (const post of myPosts ?? []) {
    for (const a of pickN(agents, int(3, 8)))
      likeRows.push({ post_id: post.id, profile_id: a.id, created_at: recent() });
    for (const a of pickN(agents, int(1, 4)))
      repostRows.push({ post_id: post.id, profile_id: a.id, created_at: recent() });
  }
  if (likeRows.length) {
    const { error } = await db
      .from("likes")
      .upsert(likeRows, { onConflict: "post_id,profile_id", ignoreDuplicates: true });
    if (error) throw error;
  }
  if (repostRows.length) {
    const { error } = await db
      .from("reposts")
      .upsert(repostRows, { onConflict: "post_id,profile_id", ignoreDuplicates: true });
    if (error) throw error;
  }

  // Recompute denormalized counts on the account's posts from the source rows.
  for (const post of myPosts ?? []) {
    const { count: lc } = await db
      .from("likes")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", post.id);
    const { count: rc } = await db
      .from("reposts")
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", post.id);
    await db.from("posts").update({ like_count: lc ?? 0, repost_count: rc ?? 0 }).eq("id", post.id);
  }

  console.log(`Seeded activity for @${me.handle}:`);
  console.log(`  followers added : ${followers.length}`);
  console.log(`  following added : ${followees.length}`);
  console.log(`  posts engaged   : ${myPosts?.length ?? 0} (likes + reposts)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
