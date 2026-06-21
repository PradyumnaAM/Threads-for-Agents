import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/Avatar";
import { RelativeTime } from "@/components/RelativeTime";
import { RepostIcon } from "@/components/icons";
import { PostActions } from "@/components/PostActions";
import type { FeedPost } from "@/lib/types";

export function PostCard({
  post,
  featured = false,
  authed = false,
}: {
  post: FeedPost;
  featured?: boolean;
  authed?: boolean;
}) {
  const a = post.author;
  const profileHref = `/${a.handle}`;
  const threadHref = `/${a.handle}/post/${post.id}`;
  const repostedBy = post.reposted_by;

  return (
    <article
      className={`border-b border-border px-4 py-4 sm:px-5 ${
        featured ? "" : "transition-colors hover:bg-surface"
      }`}
    >
      {repostedBy && (
        <div className="mb-1.5 flex items-center gap-2 pl-[3.25rem] text-[13px] font-medium text-muted">
          <RepostIcon width={14} height={14} className="text-green-500" />
          <Link href={`/${repostedBy.handle}`} className="hover:underline">
            {repostedBy.display_name} reposted
          </Link>
        </div>
      )}

      <div className="flex items-start gap-3">
      <Link href={profileHref} className="shrink-0">
        <Avatar src={a.avatar_url} name={a.display_name} size={featured ? 48 : 44} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={profileHref} className="truncate font-semibold leading-tight hover:underline">
            {a.display_name}
          </Link>
          <Link href={profileHref} className="truncate text-sm text-muted hover:underline">
            @{a.handle}
          </Link>
          <span className="text-sm text-muted">·</span>
          {featured ? (
            <span className="text-sm text-muted">
              <RelativeTime iso={post.created_at} />
            </span>
          ) : (
            <Link href={threadHref} className="text-sm text-muted hover:underline">
              <RelativeTime iso={post.created_at} />
            </Link>
          )}
        </div>

        {featured ? (
          <p className="mt-1.5 whitespace-pre-wrap break-words text-[17px] leading-relaxed text-foreground">
            {post.body}
          </p>
        ) : (
          <Link href={threadHref} className="block">
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">
              {post.body}
            </p>
          </Link>
        )}

        {post.image_url &&
          (featured ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <Image
                src={post.image_url}
                alt={`Image shared by ${a.display_name}`}
                width={1600}
                height={900}
                className="h-auto w-full"
                unoptimized
              />
            </div>
          ) : (
            <Link
              href={threadHref}
              className="mt-3 block overflow-hidden rounded-xl border border-border"
            >
              <Image
                src={post.image_url}
                alt={`Image shared by ${a.display_name}`}
                width={1600}
                height={900}
                className="h-auto w-full"
                unoptimized
              />
            </Link>
          ))}

          <PostActions
            postId={post.id}
            threadHref={threadHref}
            likeCount={post.like_count}
            replyCount={post.reply_count}
            repostCount={post.repost_count}
            liked={post.viewer_liked}
            reposted={post.viewer_reposted}
            authed={authed}
          />
        </div>
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-border" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-3.5 w-40 animate-pulse rounded bg-border" />
        <div className="h-3.5 w-full animate-pulse rounded bg-border" />
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}
