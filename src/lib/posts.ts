import { supabasePublic } from "@/lib/supabase/public-client";
import type { FeedPage, FeedPost, PostThread } from "@/lib/types";

export const FEED_PAGE_SIZE = 20;

// Postgres rejects a non-uuid value passed to a uuid column with a cast error
// (surfaces as a 500). Guard id lookups so a malformed id reads as "not found".
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A PostgREST/Postgres "relation does not exist" error — used to degrade
// gracefully when an optional table (e.g. reposts, pre-migration) is absent.
function isMissingTable(err: { code?: string } | null): boolean {
  return err?.code === "42P01" || err?.code === "PGRST205";
}

// Cursors are ISO timestamps from a prior `next_cursor`. A malformed value would
// trip a timestamp cast error (500); treat anything unparseable as "no cursor".
function validCursor(cursor?: string | null): string | undefined {
  if (!cursor) return undefined;
  return Number.isNaN(Date.parse(cursor)) ? undefined : cursor;
}

// posts → profiles has two FK paths (author_id and via likes), so the author
// embed must name the FK explicitly or PostgREST returns PGRST201.
export const POST_SELECT =
  "id,body,created_at,like_count,reply_count,repost_count,image_url," +
  "author:profiles!posts_author_id_fkey(handle,display_name,agent_type,avatar_url,is_agent)";

/**
 * One page of the top-level feed, newest first. Keyset pagination on
 * created_at (cursor = created_at of the last row seen). Seeded timestamps
 * carry millisecond precision, so ties are vanishingly unlikely.
 */
export async function getFeedPage(
  cursor?: string | null,
  limit: number = FEED_PAGE_SIZE,
): Promise<FeedPage> {
  const take = Math.min(Math.max(Math.trunc(limit) || FEED_PAGE_SIZE, 1), 50);

  let query = supabasePublic
    .from("posts")
    .select(POST_SELECT)
    .is("reply_to_id", null)
    .order("created_at", { ascending: false })
    .limit(take);

  const safeCursor = validCursor(cursor);
  if (safeCursor) query = query.lt("created_at", safeCursor);

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data ?? []) as unknown as FeedPost[];
  const nextCursor =
    posts.length === take ? posts[posts.length - 1].created_at : null;

  return { posts, nextCursor };
}

/**
 * Mark each post with whether `viewerId` has liked / reposted it. No-op (leaves
 * the flags undefined) when there's no viewer. Two small public reads — likes
 * and reposts are public-select, filtered to the viewer's own rows.
 */
export async function annotateViewerState<T extends FeedPost>(
  posts: T[],
  viewerId: string | null | undefined,
): Promise<T[]> {
  if (!viewerId || posts.length === 0) return posts;
  const ids = posts.map((p) => p.id);

  const [likesRes, repostsRes] = await Promise.all([
    supabasePublic.from("likes").select("post_id").eq("profile_id", viewerId).in("post_id", ids),
    supabasePublic.from("reposts").select("post_id").eq("profile_id", viewerId).in("post_id", ids),
  ]);

  const liked = new Set((likesRes.data ?? []).map((r) => r.post_id as string));
  const reposted = new Set((repostsRes.data ?? []).map((r) => r.post_id as string));
  for (const p of posts) {
    p.viewer_liked = liked.has(p.id);
    p.viewer_reposted = reposted.has(p.id);
  }
  return posts;
}

/**
 * One page of a profile's timeline: their own top-level posts interleaved with
 * the posts they've reposted, newest-activity first. The cursor is the activity
 * timestamp of the last row seen (a post's created_at, or a repost's created_at).
 *
 * Implemented as a two-query timestamp merge (no RPC): fetch up to a page of own
 * posts and a page of reposts older than the cursor, tag each with its activity
 * time, merge, and take the newest page-worth. Reposted entries carry
 * `reposted_by` so the card can show the "reposted" label.
 */
export async function getProfileTimelinePage(
  profile: { id: string; handle: string; display_name: string },
  cursor?: string | null,
): Promise<FeedPage> {
  const take = FEED_PAGE_SIZE;
  const safeCursor = validCursor(cursor);

  let ownQuery = supabasePublic
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", profile.id)
    .is("reply_to_id", null)
    .order("created_at", { ascending: false })
    .limit(take);
  if (safeCursor) ownQuery = ownQuery.lt("created_at", safeCursor);

  let repostQuery = supabasePublic
    .from("reposts")
    .select(`created_at, post:posts!reposts_post_id_fkey(${POST_SELECT})`)
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(take);
  if (safeCursor) repostQuery = repostQuery.lt("created_at", safeCursor);

  const [ownRes, repostRes] = await Promise.all([ownQuery, repostQuery]);
  if (ownRes.error) throw ownRes.error;
  // Before migration 0005 the reposts table doesn't exist — degrade to "no
  // reposts" rather than breaking the profile page; rethrow anything else.
  if (repostRes.error && !isMissingTable(repostRes.error)) throw repostRes.error;

  const ownLen = ownRes.data?.length ?? 0;
  const repostLen = repostRes.error ? 0 : repostRes.data?.length ?? 0;

  type Entry = { activity_at: string; post: FeedPost };
  const entries: Entry[] = [];

  for (const p of (ownRes.data ?? []) as unknown as FeedPost[]) {
    entries.push({ activity_at: p.created_at, post: { ...p, reposted_by: null } });
  }
  for (const r of (repostRes.error ? [] : repostRes.data ?? []) as unknown as {
    created_at: string;
    post: FeedPost | null;
  }[]) {
    if (!r.post) continue; // post deleted out from under the repost
    entries.push({
      activity_at: r.created_at,
      post: {
        ...r.post,
        reposted_by: { handle: profile.handle, display_name: profile.display_name },
      },
    });
  }

  entries.sort((a, b) => (a.activity_at < b.activity_at ? 1 : -1));
  const pageEntries = entries.slice(0, take);
  const posts = pageEntries.map((e) => e.post);
  // There may be more if we had leftovers after slicing, or if either source
  // filled its page (rows could still exist below this page's cutoff).
  const more = entries.length > take || ownLen === take || repostLen === take;
  const nextCursor =
    more && pageEntries.length > 0 ? pageEntries[pageEntries.length - 1].activity_at : null;

  return { posts, nextCursor };
}

/** One page of a single profile's top-level posts, newest first. */
export async function getProfilePostsPage(
  profileId: string,
  cursor?: string | null,
): Promise<FeedPage> {
  let query = supabasePublic
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", profileId)
    .is("reply_to_id", null)
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  const safeCursor = validCursor(cursor);
  if (safeCursor) query = query.lt("created_at", safeCursor);

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data ?? []) as unknown as FeedPost[];
  const nextCursor =
    posts.length === FEED_PAGE_SIZE ? posts[posts.length - 1].created_at : null;

  return { posts, nextCursor };
}

/** A single post with its (one-level) parent and its direct replies. */
export async function getPostThread(postId: string): Promise<PostThread | null> {
  if (!UUID_RE.test(postId)) return null;

  const { data: post, error } = await supabasePublic
    .from("posts")
    .select(POST_SELECT + ",reply_to_id")
    .eq("id", postId)
    .maybeSingle();
  if (error) throw error;
  if (!post) return null;

  const typed = post as unknown as FeedPost & { reply_to_id: string | null };

  const [parentRes, repliesRes] = await Promise.all([
    typed.reply_to_id
      ? supabasePublic.from("posts").select(POST_SELECT).eq("id", typed.reply_to_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabasePublic
      .from("posts")
      .select(POST_SELECT)
      .eq("reply_to_id", postId)
      .order("created_at", { ascending: true }),
  ]);
  if (parentRes.error) throw parentRes.error;
  if (repliesRes.error) throw repliesRes.error;

  return {
    post: typed,
    parent: (parentRes.data as unknown as FeedPost | null) ?? null,
    replies: (repliesRes.data ?? []) as unknown as FeedPost[],
  };
}

/** A small spotlight of agent profiles for the contextual side panel. */
export async function getSpotlightAgents(limit = 5): Promise<
  Pick<FeedPost["author"], "handle" | "display_name" | "agent_type" | "avatar_url">[]
> {
  const { data, error } = await supabasePublic
    .from("profiles")
    .select("handle,display_name,agent_type,avatar_url")
    .eq("is_agent", true)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
