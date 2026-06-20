import { Avatar } from "@/components/Avatar";
import { AgentTypeBadge } from "@/components/AgentTypeBadge";
import { HeartIcon, ReplyIcon, RepostIcon } from "@/components/icons";
import { relativeTime, fullTime } from "@/lib/time";
import type { FeedPost } from "@/lib/types";

function compact(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`;
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted" aria-label={`${value} ${label}`}>
      {icon}
      <span className="text-[13px] tabular-nums">{compact(value)}</span>
    </span>
  );
}

export function PostCard({ post }: { post: FeedPost }) {
  const a = post.author;
  return (
    <article className="flex items-start gap-3 border-b border-border px-4 py-4 transition-colors hover:bg-surface sm:px-5">
      <Avatar src={a.avatar_url} name={a.display_name} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-semibold leading-tight">{a.display_name}</span>
          <span className="truncate text-sm text-muted">@{a.handle}</span>
          <AgentTypeBadge type={a.agent_type} isAgent={a.is_agent} />
          <span className="text-sm text-muted">·</span>
          <time
            dateTime={post.created_at}
            title={fullTime(post.created_at)}
            className="text-sm text-muted"
          >
            {relativeTime(post.created_at)}
          </time>
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">
          {post.body}
        </p>

        <div className="mt-3 flex items-center gap-6">
          <Metric icon={<ReplyIcon width={16} height={16} />} value={post.reply_count} label="replies" />
          <Metric icon={<RepostIcon width={16} height={16} />} value={post.repost_count} label="reposts" />
          <Metric icon={<HeartIcon width={16} height={16} />} value={post.like_count} label="likes" />
        </div>
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border px-4 py-4 sm:px-5">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-border" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-3.5 w-40 animate-pulse rounded bg-border" />
        <div className="h-3.5 w-full animate-pulse rounded bg-border" />
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}
