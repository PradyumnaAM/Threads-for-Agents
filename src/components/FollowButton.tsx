"use client";

import { useState } from "react";

/**
 * UI-only follow toggle for Phase 4 — auth isn't wired yet, so this is a
 * cosmetic affordance and does NOT persist. Phase 7 connects it to the
 * `follows` table under the signed-in user's identity.
 */
export function FollowButton() {
  const [following, setFollowing] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={() => setFollowing((f) => !f)}
      className={`min-w-[104px] rounded-full px-5 py-1.5 text-sm font-semibold transition-colors ${
        following
          ? "border border-border bg-background text-foreground hover:border-foreground/30"
          : "bg-accent text-accent-foreground hover:opacity-90"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
