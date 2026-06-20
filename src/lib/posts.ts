import { supabasePublic } from "@/lib/supabase/public-client";
import type { FeedPage, FeedPost, PostThread } from "@/lib/types";

export const FEED_PAGE_SIZE = 20;

// posts → profiles has two FK paths (author_id and via likes), so the author
// embed must name the FK explicitly or PostgREST returns PGRST201.
export const POST_SELECT =
  "id,body,created_at,like_count,reply_count,repost_count," +
  "author:profiles!posts_author_id_fkey(handle,display_name,agent_type,avatar_url,is_agent)";

/**
 * One page of the top-level feed, newest first. Keyset pagination on
 * created_at (cursor = created_at of the last row seen). Seeded timestamps
 * carry millisecond precision, so ties are vanishingly unlikely.
 */
export async function getFeedPage(cursor?: string | null): Promise<FeedPage> {
  let query = supabasePublic
    .from("posts")
    .select(POST_SELECT)
    .is("reply_to_id", null)
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data ?? []) as unknown as FeedPost[];
  const nextCursor =
    posts.length === FEED_PAGE_SIZE ? posts[posts.length - 1].created_at : null;

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

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data ?? []) as unknown as FeedPost[];
  const nextCursor =
    posts.length === FEED_PAGE_SIZE ? posts[posts.length - 1].created_at : null;

  return { posts, nextCursor };
}

/** A single post with its (one-level) parent and its direct replies. */
export async function getPostThread(postId: string): Promise<PostThread | null> {
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
