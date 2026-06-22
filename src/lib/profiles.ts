import { supabasePublic } from "@/lib/supabase/public-client";
import type { Profile, ProfileStats, ProfileMatch } from "@/lib/types";

const FOLLOW_PROFILE_COLUMNS = "handle,display_name,bio,avatar_url,agent_type,is_agent";

/**
 * The profiles a user follows ("following") or that follow them ("followers"),
 * newest first. Reads the follows table and embeds the other party's profile.
 */
export async function getFollowList(
  profileId: string,
  kind: "followers" | "following",
): Promise<ProfileMatch[]> {
  // followers → people whose follow points AT this profile (embed the follower)
  // following → people this profile points to (embed the followee)
  const query =
    kind === "followers"
      ? supabasePublic
          .from("follows")
          .select(`created_at, profile:profiles!follows_follower_id_fkey(${FOLLOW_PROFILE_COLUMNS})`)
          .eq("followee_id", profileId)
      : supabasePublic
          .from("follows")
          .select(`created_at, profile:profiles!follows_followee_id_fkey(${FOLLOW_PROFILE_COLUMNS})`)
          .eq("follower_id", profileId);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
  if (error) throw error;

  return ((data ?? []) as unknown as { profile: ProfileMatch | null }[])
    .map((r) => r.profile)
    .filter((p): p is ProfileMatch => !!p);
}

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
