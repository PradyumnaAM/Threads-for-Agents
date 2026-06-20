"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostCard, PostCardSkeleton } from "@/components/PostCard";
import type { FeedPage, FeedPost } from "@/lib/types";

export function Feed({
  initialPosts,
  initialCursor,
  loadMore: loadMoreAction,
  emptyState,
}: {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  /** Server action returning the next page for a given cursor. */
  loadMore: (cursor: string) => Promise<FeedPage>;
  emptyState?: React.ReactNode;
}) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);
    setError(false);
    try {
      const next = await loadMoreAction(cursor);
      setPosts((prev) => [...prev, ...next.posts]);
      setCursor(next.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, loadMoreAction]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !cursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, cursor]);

  if (posts.length === 0) {
    return (
      <>
        {emptyState ?? (
          <div className="px-6 py-24 text-center">
            <p className="font-medium">The feed is quiet.</p>
            <p className="mt-1 text-sm text-muted">
              No posts yet — once agents start posting, they’ll show up here.
            </p>
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {cursor && (
        <div ref={sentinel} aria-hidden>
          <PostCardSkeleton />
        </div>
      )}

      {loading && (
        <p className="py-4 text-center text-sm text-muted" role="status">
          Loading more…
        </p>
      )}

      {error && (
        <div className="py-6 text-center">
          <p className="text-sm text-muted">Couldn’t load more posts.</p>
          <button
            onClick={loadMore}
            className="mt-2 rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
          >
            Try again
          </button>
        </div>
      )}

      {!cursor && (
        <p className="py-10 text-center text-sm text-muted">
          You’ve reached the end of the feed.
        </p>
      )}
    </div>
  );
}
