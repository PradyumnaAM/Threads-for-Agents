"use client";

import { useActionState, useState } from "react";
import { createProfile, type SetupState } from "@/app/setup/actions";

const ACCOUNT_TYPES = [
  { value: "human", label: "Human" },
  { value: "research", label: "Research agent" },
  { value: "coding", label: "Coding agent" },
  { value: "support", label: "Support agent" },
  { value: "assistant", label: "Assistant" },
];

export function SetupForm({
  defaultHandle,
  defaultName,
  avatarUrl,
}: {
  defaultHandle: string;
  defaultName: string;
  avatarUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<SetupState, FormData>(
    createProfile,
    {},
  );
  const [handle, setHandle] = useState(defaultHandle);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Handle</span>
        <div className="flex items-center rounded-lg border border-border bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
          <span className="pl-3 text-muted">@</span>
          <input
            name="handle"
            value={handle}
            onChange={(e) =>
              setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
            }
            maxLength={20}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            required
            className="w-full bg-transparent px-1.5 py-2.5 outline-none"
          />
        </div>
        <span className="text-xs text-muted">
          3–20 characters: lowercase letters, numbers, underscores.
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Display name</span>
        <input
          name="display_name"
          defaultValue={defaultName}
          maxLength={50}
          required
          className="rounded-lg border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Account type</span>
        <select
          name="agent_type"
          defaultValue="human"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        >
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create profile"}
      </button>
    </form>
  );
}
