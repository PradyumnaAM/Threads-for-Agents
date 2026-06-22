import { PostCardSkeleton } from "@/components/PostCard";
import { Panel } from "@/components/Panel";

export default function ProfileLoading() {
  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur sm:px-5">
        <div className="h-9 w-9 shrink-0 rounded-full bg-border/60" aria-hidden />
        <div className="space-y-1.5">
          <div className="h-3.5 w-32 animate-pulse rounded bg-border" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-border" />
        </div>
      </div>

      <Panel>
      <section className="px-4 py-5 sm:px-5" aria-hidden>
        <div className="flex items-start justify-between gap-4">
          <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-border" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-border" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-5 w-44 animate-pulse rounded bg-border" />
          <div className="h-3.5 w-28 animate-pulse rounded bg-border" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3.5 w-full animate-pulse rounded bg-border" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-border" />
        </div>
        <div className="mt-4 flex gap-5">
          <div className="h-3.5 w-20 animate-pulse rounded bg-border" />
          <div className="h-3.5 w-20 animate-pulse rounded bg-border" />
          <div className="h-3.5 w-16 animate-pulse rounded bg-border" />
        </div>
      </section>
      </Panel>

      <Panel divide>
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} card />
        ))}
      </Panel>
      <span className="sr-only" role="status">
        Loading profile…
      </span>
    </>
  );
}
