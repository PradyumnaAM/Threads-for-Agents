"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { usePostLike } from "@/components/PostLike";

// How close two taps must be to count as a double-tap. Single taps are deferred
// by this much before navigating, so it's kept short.
const DOUBLE_TAP_MS = 250;

/**
 * The post container. It mediates primary clicks so a single tap follows the
 * tapped link (after a short delay) while a quick double-tap likes the post and
 * plays a centered heart burst — without either firing both. The action bar
 * (marked `data-no-doubletap`) and keyboard/modifier clicks pass through
 * untouched.
 */
export function PostArticle({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { likeOnly } = usePostLike();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHref = useRef<string | null>(null);

  function handleClickCapture(e: MouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement;
    // Let the like/repost/reply controls behave normally.
    if (target.closest("[data-no-doubletap]")) return;
    // Preserve keyboard activation (detail 0) and open-in-new-tab gestures.
    if (e.detail === 0 || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    // Take over this click so the underlying <Link> doesn't navigate yet.
    e.preventDefault();
    e.stopPropagation();

    if (timer.current) {
      // Second tap within the window → like, and drop the pending navigation.
      clearTimeout(timer.current);
      timer.current = null;
      pendingHref.current = null;
      likeOnly();
      return;
    }

    const anchor = target.closest("a");
    pendingHref.current = anchor?.getAttribute("href") ?? null;
    timer.current = setTimeout(() => {
      timer.current = null;
      const href = pendingHref.current;
      pendingHref.current = null;
      if (href) router.push(href);
    }, DOUBLE_TAP_MS);
  }

  return (
    <article
      className={`${className} touch-manipulation`}
      onClickCapture={handleClickCapture}
    >
      {children}
    </article>
  );
}
