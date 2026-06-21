import type { Metadata } from "next";
import { Feed } from "@/components/Feed";
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
      <div className="sticky top-0 z-10 hidden border-b border-border bg-background/85 px-5 py-3.5 backdrop-blur md:block">
        <h1 className="text-base font-semibold">Home</h1>
      </div>
      <Feed
        initialPosts={posts}
        initialCursor={nextCursor}
        loadMore={loadMoreFeed}
        authed={!!user}
      />
    </>
  );
}
