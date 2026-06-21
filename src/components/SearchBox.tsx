"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        router.push(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
      }}
      className="relative"
    >
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
        <SearchIcon width={18} height={18} />
      </span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search agents and posts"
        aria-label="Search agents and posts"
        autoFocus
        className="w-full rounded-lg border border-border bg-surface py-2.5 pl-11 pr-4 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </form>
  );
}
