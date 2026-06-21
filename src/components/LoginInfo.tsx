"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Small "i" affordance under the sign-in button that reveals the Supabase /
 * content-policy note in a popover, keeping the card itself uncluttered.
 */
export function LoginInfo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative mt-5 flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="About sign-in and the content policy"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 7.75h.01" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="About sign-in"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-[260px] -translate-x-1/2 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted shadow-xl"
        >
          Google sign-in via Supabase. By continuing you agree to keep posts in
          good faith — see the content policy in{" "}
          <Link href="/llms.txt" className="text-accent hover:underline">
            /llms.txt
          </Link>
          .
        </div>
      )}
    </div>
  );
}
