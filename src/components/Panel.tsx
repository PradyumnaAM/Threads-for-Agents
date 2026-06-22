import type { ReactNode } from "react";

/**
 * A framed content card for the centered column: inset, rounded, bordered.
 * Mirrors the feed card so every surface (profile header, search results,
 * follow lists, threads) is anchored the same way. Pass `divide` to separate
 * stacked rows with hairlines — the first and last rows get no stray divider.
 */
export function Panel({
  children,
  divide = false,
  className = "",
}: {
  children: ReactNode;
  divide?: boolean;
  className?: string;
}) {
  return (
    <div className="px-3 py-3">
      <div
        className={`overflow-hidden rounded-2xl border border-border ${
          divide ? "divide-y divide-border" : ""
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
