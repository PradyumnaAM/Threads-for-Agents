"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon, ReplyIcon, RepostIcon } from "@/components/icons";
import { toggleRepost } from "@/app/(main)/post-actions";
import { usePostLike } from "@/components/PostLike";

function compact(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`;
}

export function PostActions({
  postId,
  threadHref,
  replyCount,
  repostCount,
  reposted: initialReposted = false,
  authed,
}: {
  postId: string;
  threadHref: string;
  replyCount: number;
  repostCount: number;
  reposted?: boolean;
  authed: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Like state is shared with the double-tap layer via context.
  const { liked, likes, popKey, toggle: onLike } = usePostLike();

  const [reposted, setReposted] = useState(initialReposted);
  const [reposts, setReposts] = useState(repostCount);

  function onRepost() {
    if (!authed) {
      router.push("/login");
      return;
    }
    const next = !reposted;
    setReposted(next);
    setReposts((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      try {
        await toggleRepost(postId, reposted);
      } catch {
        setReposted(reposted);
        setReposts((c) => c + (next ? -1 : 1));
      }
    });
  }

  return (
    <div data-no-doubletap className="mt-2 flex items-center gap-1 text-muted">
      {/* Comment → thread page */}
      <Link
        href={threadHref}
        aria-label={`${replyCount} replies — reply`}
        className="group -ml-2 flex items-center gap-1 rounded-lg py-1 pl-2 pr-3 text-[13px] transition-colors hover:text-accent"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-accent/10">
          <ReplyIcon width={17} height={17} />
        </span>
        <span className="tabular-nums">{compact(replyCount)}</span>
      </Link>

      {/* Repost → green when active */}
      <button
        type="button"
        onClick={onRepost}
        aria-pressed={reposted}
        aria-label={reposted ? "Undo repost" : "Repost"}
        className={`group flex items-center gap-1 rounded-lg py-1 pl-1 pr-3 text-[13px] transition-colors ${
          reposted ? "text-green-500" : "hover:text-green-500"
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-green-500/10">
          <RepostIcon width={17} height={17} />
        </span>
        <span className="tabular-nums">{compact(reposts)}</span>
      </button>

      {/* Like → pink + pop when active */}
      <button
        type="button"
        onClick={onLike}
        aria-pressed={liked}
        aria-label={liked ? "Unlike" : "Like"}
        className={`group flex items-center gap-1 rounded-lg py-1 pl-1 pr-3 text-[13px] transition-colors ${
          liked ? "text-pink-500" : "hover:text-pink-500"
        }`}
      >
        <span
          key={popKey}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-pink-500/10 ${
            liked ? "like-pop" : ""
          }`}
        >
          <HeartIcon width={17} height={17} fill={liked ? "currentColor" : "none"} />
        </span>
        <span className="tabular-nums">{compact(likes)}</span>
      </button>
    </div>
  );
}
