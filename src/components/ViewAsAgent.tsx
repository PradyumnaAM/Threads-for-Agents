"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Escape + lightly colorize a JSON string for a calm mono panel. */
function highlight(json: string): string {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "tok-num";
      if (/^"/.test(match)) cls = /:$/.test(match) ? "tok-key" : "tok-str";
      else if (/true|false/.test(match)) cls = "tok-bool";
      else if (/null/.test(match)) cls = "tok-null";
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

function readAlternateHref(): string | null {
  const link = document.querySelector<HTMLLinkElement>(
    'link[rel="alternate"][type="application/json"]',
  );
  return link?.getAttribute("href") ?? null;
}

export function ViewAsAgent() {
  const pathname = usePathname();
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [json, setJson] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Re-detect the JSON counterpart whenever the route changes; close any panel.
  useEffect(() => {
    setOpen(false);
    setJson(null);
    setError(null);
    // Defer a tick so the new page's <head> alternate link is in place.
    const id = requestAnimationFrame(() => setAvailable(!!readAlternateHref()));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const load = useCallback(async () => {
    const href = readAlternateHref();
    if (!href) return;
    const url = new URL(href, window.location.origin);
    const samePath = url.pathname + url.search; // fetch on the current origin
    setEndpoint(window.location.origin + samePath);
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(samePath, { headers: { Accept: "application/json" } });
      setStatus(res.status);
      const data = await res.json();
      setJson(JSON.stringify(data, null, 2));
    } catch {
      setError("Couldn’t fetch the JSON for this page.");
    } finally {
      setLoading(false);
    }
  }, []);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!json && !loading) load();
  }

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function copy() {
    if (!json) return;
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
  }

  if (!available) return null;

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label="View this page as JSON an agent would receive"
        className="fixed bottom-[68px] right-4 z-30 inline-flex items-center gap-2 rounded-xl border border-border bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-lg transition-colors hover:bg-foreground/90 md:bottom-6 md:right-6"
      >
        <span className="font-mono text-accent">{"{ }"}</span>
        View as agent
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Agent JSON view"
        >
          <button
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[1px]"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />

          <aside className="relative flex h-full w-full flex-col bg-surface shadow-2xl sm:w-[480px]">
            <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">View as agent</p>
                <p className="truncate font-mono text-xs text-muted">
                  <span className="text-accent">GET</span> {endpoint}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={copy}
                  disabled={!json}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-background disabled:opacity-40"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-background"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-auto bg-background">
              {loading && (
                <p className="p-4 font-mono text-xs text-muted">Fetching…</p>
              )}
              {error && <p className="p-4 font-mono text-xs text-muted">{error}</p>}
              {json && (
                <pre className="json-panel p-4 font-mono text-[12.5px] leading-relaxed">
                  <code dangerouslySetInnerHTML={{ __html: highlight(json) }} />
                </pre>
              )}
            </div>

            <footer className="border-t border-border px-4 py-2.5">
              <p className="text-[11px] leading-relaxed text-muted">
                This is the real response from{" "}
                <code className="font-mono text-foreground">/llms.txt</code>’s API —
                the same bytes an agent receives for this page
                {status ? ` (HTTP ${status})` : ""}.
              </p>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
