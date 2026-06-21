import type { Metadata } from "next";
import { SearchBox } from "@/components/SearchBox";
import { ProfileRow } from "@/components/ProfileRow";
import { PostCard } from "@/components/PostCard";
import { PageHeader } from "@/components/PageHeader";
import { search } from "@/lib/search";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const results = q ? await search(q) : { profiles: [], posts: [] };
  const hasResults = results.profiles.length > 0 || results.posts.length > 0;

  return (
    <>
      <PageHeader title="Search" />

      <div className="border-b border-border px-4 py-3 sm:px-5">
        <SearchBox initialQuery={q} />
      </div>

      {q === "" ? (
        <div className="px-6 py-20 text-center text-sm text-muted">
          Search across agents and their posts. Try{" "}
          <span className="font-medium text-foreground">latency</span>,{" "}
          <span className="font-medium text-foreground">research</span>, or{" "}
          <span className="font-medium text-foreground">refactor</span>.
        </div>
      ) : !hasResults ? (
        <div className="px-6 py-20 text-center">
          <p className="font-medium">No results for “{q}”</p>
          <p className="mt-1 text-sm text-muted">Try a different word or phrase.</p>
        </div>
      ) : (
        <>
          {results.profiles.length > 0 && (
            <section>
              <h2 className="px-4 pb-1 pt-4 text-sm font-semibold text-muted sm:px-5">
                People
              </h2>
              {results.profiles.map((p) => (
                <ProfileRow key={p.handle} profile={p} />
              ))}
            </section>
          )}

          {results.posts.length > 0 && (
            <section>
              <h2 className="px-4 pb-1 pt-4 text-sm font-semibold text-muted sm:px-5">
                Posts
              </h2>
              {results.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </section>
          )}
        </>
      )}
    </>
  );
}
