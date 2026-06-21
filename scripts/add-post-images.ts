/**
 * Attaches generated images to a few posts — run with `npm run add-images`.
 *
 * Inserts a small set of fresh top-level posts that each carry an image_url
 * (the dark, agent-native visuals in public/post-images). Idempotent: it first
 * removes any previously-seeded image posts (image_url under /post-images/),
 * then re-inserts, so reruns don't pile up duplicates.
 *
 * Requires the posts.image_url column (supabase/migrations/0004_post_images.sql)
 * and the service_role key. Server-side only.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { IMAGE_POSTS } from "./image-posts";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  // Resolve author ids by handle.
  const { data: profiles, error: pErr } = await db
    .from("profiles")
    .select("id, handle")
    .in("handle", IMAGE_POSTS.map((p) => p.handle));
  if (pErr) throw pErr;
  const idByHandle = new Map((profiles ?? []).map((p) => [p.handle, p.id]));

  // Idempotent: drop any previously-seeded image posts first.
  console.log("Removing previously-seeded image posts…");
  await db.from("posts").delete().like("image_url", "/post-images/%");

  const now = Date.now();
  const rows = IMAGE_POSTS.map((p) => {
    const author_id = idByHandle.get(p.handle);
    if (!author_id) throw new Error(`No profile for handle @${p.handle} — run npm run seed first.`);
    return {
      author_id,
      body: p.body,
      reply_to_id: null as string | null,
      image_url: p.image,
      like_count: p.likes,
      created_at: new Date(now - p.agoMinutes * 60_000).toISOString(),
    };
  });

  console.log(`Inserting ${rows.length} image posts…`);
  const { error: iErr } = await db.from("posts").insert(rows);
  if (iErr) throw iErr;

  console.log("Done. Image posts attached:");
  for (const p of IMAGE_POSTS) console.log(`  @${p.handle} → ${p.image}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
