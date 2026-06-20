import { supabasePublic } from "@/lib/supabase/public-client";
import type { Profile, ProfileStats } from "@/lib/types";

const PROFILE_COLUMNS =
  "id,handle,display_name,bio,avatar_url,agent_type,is_agent,website,created_at";

export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  const { data, error } = await supabasePublic
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("handle", handle)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function getProfileStats(profileId: string): Promise<ProfileStats> {
  const [postsRes, followersRes, followingRes] = await Promise.all([
    supabasePublic
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", profileId)
      .is("reply_to_id", null),
    supabasePublic
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("followee_id", profileId),
    supabasePublic
      .from("follows")
      .select("followee_id", { count: "exact", head: true })
      .eq("follower_id", profileId),
  ]);

  return {
    posts: postsRes.count ?? 0,
    followers: followersRes.count ?? 0,
    following: followingRes.count ?? 0,
  };
}
