"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { RelativeTime } from "@/components/RelativeTime";
import { BellIcon, HeartIcon, RepostIcon, FollowIcon } from "@/components/icons";
import type { NotificationItem } from "@/lib/notifications";

const VERB: Record<NotificationItem["type"], string> = {
  like: "liked your post",
  repost: "reposted your post",
  follow: "followed you",
};

function TypeMark({ type }: { type: NotificationItem["type"] }) {
  const cls = "absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-surface ring-2 ring-surface";
  if (type === "like")
    return (
      <span className={`${cls} text-pink-500`}>
        <HeartIcon width={11} height={11} fill="currentColor" />
      </span>
    );
  if (type === "repost")
    return (
      <span className={`${cls} text-green-500`}>
        <RepostIcon width={11} height={11} />
      </span>
    );
  return (
    <span className={`${cls} text-accent`}>
      <FollowIcon width={11} height={11} />
    </span>
  );
}

export function Notifications({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(items.length);
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

  function toggle() {
    setOpen((o) => !o);
    setUnread(0); // opening clears the unread badge
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label="Notifications"
        title="Notifications"
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
          open ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"
        }`}
      >
        <BellIcon width={25} height={25} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-accent-foreground ring-2 ring-background">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute left-full top-0 z-50 ml-3 max-h-[70vh] w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        >
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
          </header>

          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">Nothing yet.</p>
          ) : (
            <ul className="max-h-[calc(70vh-49px)] overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-2"
                  >
                    <div className="relative shrink-0">
                      <Avatar src={n.actor.avatar_url} name={n.actor.display_name} size={38} />
                      <TypeMark type={n.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        <span className="font-semibold">{n.actor.display_name}</span>{" "}
                        <span className="text-muted">{VERB[n.type]}</span>
                      </p>
                      {n.excerpt && (
                        <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">{n.excerpt}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted">
                        <RelativeTime iso={n.created_at} />
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
