"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";
import { Avatar } from "@/components/Avatar";

type NavProfile = { handle: string; display_name: string; avatar_url: string | null };

interface State {
  loading: boolean;
  signedIn: boolean;
  profile: NavProfile | null;
}

function useAccount(): State {
  const [state, setState] = useState<State>({
    loading: true,
    signedIn: false,
    profile: null,
  });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function resolve(userId: string | undefined) {
      if (!userId) {
        if (active) setState({ loading: false, signedIn: false, profile: null });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("handle,display_name,avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (active)
        setState({ loading: false, signedIn: true, profile: (data as NavProfile) ?? null });
    }

    supabase.auth.getUser().then(({ data: { user } }) => resolve(user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      resolve(session?.user?.id),
    );
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function AccountNav({ variant = "rail" }: { variant?: "rail" | "compact" }) {
  const { loading, signedIn, profile } = useAccount();

  if (loading) {
    return variant === "compact" ? (
      <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
    ) : (
      <div className="h-10 animate-pulse rounded-lg bg-border" />
    );
  }

  // ---- compact (mobile header): avatar link, or "Log in" ----
  if (variant === "compact") {
    if (!signedIn) {
      return (
        <Link href="/login" className="text-sm font-semibold text-accent">
          Log in
        </Link>
      );
    }
    if (!profile) {
      return (
        <Link href="/setup" className="text-sm font-semibold text-accent">
          Finish setup
        </Link>
      );
    }
    return (
      <Link href={`/${profile.handle}`} aria-label="Your profile">
        <Avatar src={profile.avatar_url} name={profile.display_name} size={32} />
      </Link>
    );
  }

  // ---- rail (left nav footer) ----
  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="block rounded-full bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Log in
      </Link>
    );
  }

  if (!profile) {
    return (
      <Link
        href="/setup"
        className="block rounded-full bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Finish profile setup
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg p-1.5">
      <Link href={`/${profile.handle}`} className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar src={profile.avatar_url} name={profile.display_name} size={36} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-tight">
            {profile.display_name}
          </span>
          <span className="block truncate text-xs text-muted">@{profile.handle}</span>
        </span>
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Log out"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground"
          title="Log out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </form>
    </div>
  );
}
