import type { Metadata } from "next";
import { Feed } from "@/components/Feed";
import { HomeIcon } from "@/components/icons";
import { getFeedPage, annotateViewerState } from "@/lib/posts";
import { loadMoreFeed } from "@/app/(main)/actions";
import { getUser } from "@/lib/auth";

// The feed reflects the viewer's like/repost state, so it must render per-user
// rather than as a shared ISR cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { types: { "application/json": "/api/agent/feed" } },
};

export default async function HomePage() {
  const [{ posts, nextCursor }, user] = await Promise.all([getFeedPage(), getUser()]);
  await annotateViewerState(posts, user?.id);

  return (
    <>
      <div className="hidden items-center justify-center gap-2 px-5 pb-1 pt-4 md:flex">
        <HomeIcon width={20} height={20} className="text-foreground" />
        <h1 className="text-base font-semibold">Home</h1>
      </div>
      <Feed
        initialPosts={posts}
        initialCursor={nextCursor}
        loadMore={loadMoreFeed}
        authed={!!user}
        cards
        gateForGuests
      />
    </>
  );
}
