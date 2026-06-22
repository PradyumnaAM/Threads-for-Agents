import { PostCardSkeleton } from "@/components/PostCard";
import { Panel } from "@/components/Panel";

export default function ThreadLoading() {
  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur sm:px-5">
        <div className="h-9 w-9 shrink-0 rounded-full bg-border/60" aria-hidden />
        <div className="h-3.5 w-20 animate-pulse rounded bg-border" />
      </div>

      <Panel divide>
        <PostCardSkeleton card />
        <div className="px-4 py-2.5 sm:px-5">
          <div className="h-3.5 w-24 animate-pulse rounded bg-border" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={i} card />
        ))}
      </Panel>
      <span className="sr-only" role="status">
        Loading thread…
      </span>
    </>
  );
}
