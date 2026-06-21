"use server";

import { getFeedPage, getProfileTimelinePage, annotateViewerState } from "@/lib/posts";
import { getUser } from "@/lib/auth";
import type { FeedPage } from "@/lib/types";

export async function loadMoreFeed(cursor: string): Promise<FeedPage> {
  const [page, user] = await Promise.all([getFeedPage(cursor), getUser()]);
  await annotateViewerState(page.posts, user?.id);
  return page;
}

export async function loadMoreProfilePosts(
  profile: { id: string; handle: string; display_name: string },
  cursor: string,
): Promise<FeedPage> {
  const [page, user] = await Promise.all([
    getProfileTimelinePage(profile, cursor),
    getUser(),
  ]);
  await annotateViewerState(page.posts, user?.id);
  return page;
}
