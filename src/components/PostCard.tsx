import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/Avatar";
import { RelativeTime, AbsoluteTime } from "@/components/RelativeTime";
import { RepostIcon } from "@/components/icons";
import { PostActions } from "@/components/PostActions";
import { PostArticle } from "@/components/PostArticle";
import { PostLikeProvider, LikeBurst } from "@/components/PostLike";
import type { FeedPost } from "@/lib/types";

export function PostCard({
  post,
  featured = false,
  authed = false,
  card = false,
}: {
  post: FeedPost;
  featured?: boolean;
  authed?: boolean;
  /** Render as a standalone rounded card instead of a divider-separated row. */
  card?: boolean;
}) {
  const a = post.author;
  const profileHref = `/${a.handle}`;
  const threadHref = `/${a.handle}/post/${post.id}`;
  const repostedBy = post.reposted_by;

  const articleClass = card
    ? "relative px-4 py-4 transition-colors hover:bg-surface sm:px-5"
    : `relative border-b border-border px-4 py-4 sm:px-5 ${
        featured ? "" : "transition-colors hover:bg-surface"
      }`;

  return (
    <PostLikeProvider
      postId={post.id}
      initialLiked={post.viewer_liked ?? false}
      initialLikes={post.like_count}
      authed={authed}
    >
      <PostArticle className={articleClass}>
        <LikeBurst />
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
          {/* Stacked identity (name over @handle) with the timestamp trailing. */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 leading-tight">
              <Link
                href={profileHref}
                className="block truncate font-semibold hover:underline"
              >
                {a.display_name}
              </Link>
              <Link
                href={profileHref}
                className="-mt-0.5 block truncate text-sm text-muted hover:underline"
              >
                @{a.handle}
              </Link>
            </div>
            {featured ? (
              <span className="shrink-0 text-sm text-muted">
                <RelativeTime iso={post.created_at} />
              </span>
            ) : (
              <Link href={threadHref} className="shrink-0 text-sm text-muted hover:underline">
                <RelativeTime iso={post.created_at} />
              </Link>
            )}
          </div>

          {featured ? (
            <p className="mt-2 whitespace-pre-wrap break-words text-[17px] leading-relaxed text-foreground">
              {post.body}
            </p>
          ) : (
            <Link href={threadHref} className="block">
              <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">
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

          {/* Focal post gets an absolute date + divider above the actions, like
              a standalone post card; feed items stay compact. */}
          {featured ? (
            <div className="mt-3 border-t border-border pt-1">
              <p className="mt-2 text-sm text-muted">
                <AbsoluteTime iso={post.created_at} />
              </p>
              <PostActions
                postId={post.id}
                threadHref={threadHref}
                replyCount={post.reply_count}
                repostCount={post.repost_count}
                reposted={post.viewer_reposted}
                authed={authed}
              />
            </div>
          ) : (
            <PostActions
              postId={post.id}
              threadHref={threadHref}
              replyCount={post.reply_count}
              repostCount={post.repost_count}
              reposted={post.viewer_reposted}
              authed={authed}
            />
          )}
          </div>
        </div>
      </PostArticle>
    </PostLikeProvider>
  );
}

export function PostCardSkeleton({ card = false }: { card?: boolean }) {
  return (
    <div
      className={
        card
          ? "flex items-start gap-3 px-4 py-4 sm:px-5"
          : "flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5"
      }
    >
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-border" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-3.5 w-40 animate-pulse rounded bg-border" />
        <div className="h-3.5 w-full animate-pulse rounded bg-border" />
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}
