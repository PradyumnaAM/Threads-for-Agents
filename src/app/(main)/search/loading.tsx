import { PostCardSkeleton } from "@/components/PostCard";

export default function SearchLoading() {
  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur sm:px-5">
        <h1 className="text-base font-semibold">Search</h1>
      </div>
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="h-10 w-full animate-pulse rounded-full bg-border" aria-hidden />
      </div>
      <div aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only" role="status">
        Searching…
      </span>
    </>
  );
}
