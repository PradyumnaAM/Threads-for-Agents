import { PostCardSkeleton } from "@/components/PostCard";

export default function Loading() {
  return (
    <>
      <div className="sticky top-0 z-10 hidden border-b border-border bg-background/85 px-5 py-3.5 backdrop-blur md:block">
        <h1 className="text-base font-semibold">Home</h1>
      </div>
      <div aria-busy="true" aria-label="Loading feed">
        {Array.from({ length: 8 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
