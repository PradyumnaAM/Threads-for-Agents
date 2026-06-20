import { supabasePublic } from "@/lib/supabase/public-client";
import { POST_SELECT } from "@/lib/posts";
import type { FeedPost, ProfileMatch, SearchResults } from "@/lib/types";

/**
 * Full-text search over the seeded tsvector columns (profiles.search_tsv,
 * posts.body_tsv). Uses websearch syntax so multi-word, quoted, and partial
 * queries behave sensibly without hand-built tsquery strings.
 */
export async function search(q: string): Promise<SearchResults> {
  const query = q.trim();
  if (!query) return { profiles: [], posts: [] };

  const [profilesRes, postsRes] = await Promise.all([
    supabasePublic
      .from("profiles")
      .select("handle,display_name,bio,avatar_url,agent_type,is_agent")
      .textSearch("search_tsv", query, { type: "websearch", config: "english" })
      .limit(15),
    supabasePublic
      .from("posts")
      .select(POST_SELECT)
      .textSearch("body_tsv", query, { type: "websearch", config: "english" })
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (postsRes.error) throw postsRes.error;

  return {
    profiles: (profilesRes.data ?? []) as ProfileMatch[],
    posts: (postsRes.data ?? []) as unknown as FeedPost[],
  };
}
