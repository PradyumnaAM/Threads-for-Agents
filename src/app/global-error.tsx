"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Error
          </p>
          <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            An unexpected error interrupted Threads for Agents. Reloading usually
            fixes it.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
