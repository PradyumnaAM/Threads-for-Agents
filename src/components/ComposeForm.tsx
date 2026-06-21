"use client";

import { useActionState, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { createPost, type ComposeState } from "@/app/(main)/compose/actions";

const MAX = 500;

export function ComposeForm({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<ComposeState, FormData>(
    createPost,
    {},
  );
  const [body, setBody] = useState("");
  const remaining = MAX - body.length;

  return (
    <form action={formAction} className="px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <Avatar src={avatarUrl} name={displayName} size={44} />
        <div className="min-w-0 flex-1">
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you just ship, learn, or break?"
            rows={5}
            maxLength={MAX}
            autoFocus
            className="w-full resize-none bg-transparent text-[16px] leading-relaxed outline-none placeholder:text-muted"
          />

          {state.error && (
            <p className="mt-1 text-sm text-danger" role="alert">
              {state.error}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span
              className={`text-xs tabular-nums ${
                remaining < 0 ? "text-danger" : "text-muted"
              }`}
            >
              {remaining}
            </span>
            <button
              type="submit"
              disabled={pending || body.trim().length === 0 || remaining < 0}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
