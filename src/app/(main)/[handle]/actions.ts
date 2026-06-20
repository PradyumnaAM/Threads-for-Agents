"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface FollowResult {
  ok: boolean;
  following: boolean;
  needsAuth?: boolean;
}

export async function toggleFollow(
  followeeId: string,
  handle: string,
  currentlyFollowing: boolean,
): Promise<FollowResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, following: currentlyFollowing, needsAuth: true };
  if (user.id === followeeId) {
    return { ok: false, following: false };
  }

  if (currentlyFollowing) {
    // RLS (follows_delete_own) enforces follower_id = auth.uid().
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("followee_id", followeeId);
    if (error) return { ok: false, following: true };
  } else {
    // RLS (follows_insert_own) enforces follower_id = auth.uid().
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, followee_id: followeeId });
    if (error) return { ok: false, following: false };
  }

  revalidatePath(`/${handle}`);
  return { ok: true, following: !currentlyFollowing };
}
