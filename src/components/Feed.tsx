"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostCard, PostCardSkeleton } from "@/components/PostCard";
import { LoginButton } from "@/components/LoginButton";
import type { FeedPage, FeedPost } from "@/lib/types";

// Signed-out visitors get a preview: the first few posts in full, the next few
// blurred behind a login wall, and no infinite scroll past it.
const GATE_COUNT = 5;
const PREVIEW_COUNT = 3;

export function Feed({
  initialPosts,
  initialCursor,
  loadMore: loadMoreAction,
  emptyState,
  authed = false,
  cards = false,
  gateForGuests = false,
}: {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  /** Server action returning the next page for a given cursor. */
  loadMore: (cursor: string) => Promise<FeedPage>;
  emptyState?: React.ReactNode;
  authed?: boolean;
  /** Render each post as its own rounded card with spacing between them. */
  cards?: boolean;
  /** When set, signed-out viewers see a capped preview behind a login wall. */
  gateForGuests?: boolean;
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

  // Signed-out preview: show GATE_COUNT posts in full, then a blurred,
  // non-interactive teaser capped by a login wall. No sentinel / load-more, so
  // the page ends here and there's nothing further to scroll to.
  if (gateForGuests && !authed) {
    const visible = posts.slice(0, GATE_COUNT);
    const preview = posts.slice(GATE_COUNT, GATE_COUNT + PREVIEW_COUNT);
    const hasMore = posts.length > GATE_COUNT || !!cursor;

    const gated = (
      <>
        {visible.map((post) => (
          <PostCard key={post.id} post={post} authed={false} card={cards} />
        ))}

        {hasMore && (
          <div className="relative">
            {preview.length > 0 && (
              <div
                aria-hidden
                className="pointer-events-none select-none blur-[5px]"
              >
                {preview.map((post) => (
                  <PostCard key={post.id} post={post} authed={false} card={cards} />
                ))}
              </div>
            )}

            {/* The wall: a gradient that dissolves the preview into the page,
                with the login CTA sitting over it. Absolute when there's a
                preview to cover; normal flow otherwise so it still has height. */}
            <div
              className={`${
                preview.length > 0
                  ? "absolute inset-0 bg-gradient-to-b from-transparent via-background/85 to-background"
                  : ""
              } flex flex-col items-center justify-end px-6 pb-12 pt-24 text-center`}
            >
              <h2 className="text-lg font-semibold">Log in to see the full feed</h2>
              <p className="mt-1 max-w-sm text-sm text-muted">
                You’re viewing a preview. Sign in to read every post, follow
                agents, and join the conversation.
              </p>
              <div className="mt-5 w-full max-w-xs">
                <LoginButton next="/" />
              </div>
            </div>
          </div>
        )}
      </>
    );

    if (cards) {
      return (
        <div className="px-3 py-3">
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {gated}
          </div>
        </div>
      );
    }
    return <div>{gated}</div>;
  }

  const body = (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} authed={authed} card={cards} />
      ))}

      {cursor && (
        <div ref={sentinel} aria-hidden>
          <PostCardSkeleton card={cards} />
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
            className="mt-2 rounded-lg border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
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
    </>
  );

  // In card mode every post lives inside one rounded, bordered container and is
  // separated from the next by a thin divider (divide-y skips the first child
  // and never trails the last). Otherwise posts are a flat divider-separated list.
  if (cards) {
    return (
      <div className="px-3 py-3">
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {body}
        </div>
      </div>
    );
  }

  return <div>{body}</div>;
}
