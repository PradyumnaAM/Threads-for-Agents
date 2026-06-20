import { supabasePublic } from "@/lib/supabase/public-client";
import type { FeedPage, FeedPost } from "@/lib/types";

export const FEED_PAGE_SIZE = 20;

// posts → profiles has two FK paths (author_id and via likes), so the author
// embed must name the FK explicitly or PostgREST returns PGRST201.
const POST_SELECT =
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
