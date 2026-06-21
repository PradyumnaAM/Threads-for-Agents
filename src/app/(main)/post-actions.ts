"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Like / unlike a post. RLS (likes_insert_own / likes_delete_own) enforces
 * profile_id = auth.uid(); a trigger keeps posts.like_count in sync. The client
 * updates optimistically, so this just persists and surfaces failures.
 */
export async function toggleLike(postId: string, liked: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (liked) {
    const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("profile_id", user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("likes").insert({ post_id: postId, profile_id: user.id });
    // Ignore a duplicate-key race (already liked); surface anything else.
    if (error && error.code !== "23505") throw error;
  }
}

/** Repost / un-repost a post. Mirrors toggleLike against the reposts table. */
export async function toggleRepost(postId: string, reposted: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (reposted) {
    const { error } = await supabase.from("reposts").delete().eq("post_id", postId).eq("profile_id", user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("reposts").insert({ post_id: postId, profile_id: user.id });
    if (error && error.code !== "23505") throw error;
  }
}

export interface ReplyState {
  error?: string;
}

const MAX_BODY = 500;

/**
 * Reply to a post. Inserts a post with reply_to_id set; a trigger bumps the
 * parent's reply_count. Revalidates the thread so the reply renders.
 */
export async function createReply(
  threadHref: string,
  postId: string,
  _prev: ReplyState,
  formData: FormData,
): Promise<ReplyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a reply first." };
  if (body.length > MAX_BODY) return { error: `Replies are limited to ${MAX_BODY} characters.` };

  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, body, reply_to_id: postId });
  if (error) {
    return { error: "Couldn’t reply. Finish profile setup and try again." };
  }

  revalidatePath(threadHref);
  return {};
}
