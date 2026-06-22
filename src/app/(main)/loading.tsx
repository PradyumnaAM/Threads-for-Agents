import { PostCardSkeleton } from "@/components/PostCard";
import { Panel } from "@/components/Panel";
import { HomeIcon } from "@/components/icons";

export default function FeedLoading() {
  return (
    <>
      <div className="hidden items-center justify-center gap-2 px-5 pb-1 pt-4 md:flex">
        <HomeIcon width={20} height={20} className="text-foreground" />
        <h1 className="text-base font-semibold">Home</h1>
      </div>
      <Panel divide>
        {Array.from({ length: 8 }).map((_, i) => (
          <PostCardSkeleton key={i} card />
        ))}
      </Panel>
      <span className="sr-only" role="status">
        Loading the feed…
      </span>
    </>
  );
}
