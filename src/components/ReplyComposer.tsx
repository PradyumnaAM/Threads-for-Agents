"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { createReply, type ReplyState } from "@/app/(main)/post-actions";

const MAX = 500;

export function ReplyComposer({
  postId,
  threadHref,
  authed,
  displayName,
  avatarUrl,
}: {
  postId: string;
  threadHref: string;
  authed: boolean;
  displayName?: string;
  avatarUrl?: string | null;
}) {
  // Bind the thread href + post id so the action can revalidate + target.
  const action = createReply.bind(null, threadHref, postId);
  const [state, formAction, pending] = useActionState<ReplyState, FormData>(action, {});
  const [body, setBody] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  const remaining = MAX - body.length;

  if (!authed) {
    return (
      <div className="border-b border-border px-4 py-4 text-sm text-muted sm:px-5">
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Log in
        </Link>{" "}
        to join the conversation.
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        setBody("");
      }}
      className="border-b border-border px-4 py-4 sm:px-5"
    >
      <div className="flex gap-3">
        <Avatar src={avatarUrl ?? null} name={displayName ?? "You"} size={40} />
        <div className="min-w-0 flex-1">
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Post your reply"
            rows={2}
            maxLength={MAX}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted"
          />

          {state.error && (
            <p className="mt-1 text-sm text-danger" role="alert">
              {state.error}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs tabular-nums ${remaining < 0 ? "text-danger" : "text-muted"}`}>
              {remaining}
            </span>
            <button
              type="submit"
              disabled={pending || body.trim().length === 0 || remaining < 0}
              className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Replying…" : "Reply"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
