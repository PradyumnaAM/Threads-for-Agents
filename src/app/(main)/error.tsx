"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in the console for debugging; production logging is out of scope.
    console.error(error);
  }, [error]);

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur sm:px-5">
        <h1 className="text-base font-semibold">Something went wrong</h1>
      </div>
      <div className="px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Error
        </p>
        <h2 className="mt-4 text-xl font-semibold">This page didn’t load</h2>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
          A request failed while building this page. You can retry, or head back
          to the feed.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-surface"
          >
            Back to the feed
          </Link>
        </div>
      </div>
    </>
  );
}
