"use server";

import { getFeedPage } from "@/lib/posts";
import type { FeedPage } from "@/lib/types";

export async function loadMoreFeed(cursor: string): Promise<FeedPage> {
  return getFeedPage(cursor);
}
