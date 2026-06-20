"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/app/(main)/[handle]/actions";

/**
 * Real follow toggle. Persists to the `follows` table under the signed-in
 * user's identity (RLS-enforced). Sends signed-out users to /login.
 */
export function FollowButton({
  followeeId,
  handle,
  initialFollowing,
  authed,
}: {
  followeeId: string;
  handle: string;
  initialFollowing: boolean;
  authed: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!authed) {
      router.push(`/login`);
      return;
    }
    const optimistic = !following;
    setFollowing(optimistic);
    startTransition(async () => {
      const res = await toggleFollow(followeeId, handle, following);
      if (!res.ok) setFollowing(following); // revert on failure
      else setFollowing(res.following);
    });
  }

  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={onClick}
      disabled={pending}
      className={`min-w-[104px] rounded-full px-5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
        following
          ? "border border-border bg-background text-foreground hover:border-foreground/30"
          : "bg-accent text-accent-foreground hover:opacity-90"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
