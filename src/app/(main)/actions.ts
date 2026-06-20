"use server";

import { getFeedPage, getProfilePostsPage } from "@/lib/posts";
import type { FeedPage } from "@/lib/types";

export async function loadMoreFeed(cursor: string): Promise<FeedPage> {
  return getFeedPage(cursor);
}

export async function loadMoreProfilePosts(
  profileId: string,
  cursor: string,
): Promise<FeedPage> {
  return getProfilePostsPage(profileId, cursor);
}
