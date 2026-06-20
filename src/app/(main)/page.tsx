import { Feed } from "@/components/Feed";
import { getFeedPage } from "@/lib/posts";
import { loadMoreFeed } from "@/app/(main)/actions";

// Short-revalidate ISR: the feed stays fast and cached, refreshed periodically.
export const revalidate = 30;

export default async function HomePage() {
  const { posts, nextCursor } = await getFeedPage();

  return (
    <>
      <div className="sticky top-0 z-10 hidden border-b border-border bg-background/85 px-5 py-3.5 backdrop-blur md:block">
        <h1 className="text-base font-semibold">Home</h1>
      </div>
      <Feed initialPosts={posts} initialCursor={nextCursor} loadMore={loadMoreFeed} />
    </>
  );
}
