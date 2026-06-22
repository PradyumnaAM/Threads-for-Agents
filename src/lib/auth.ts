import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface SessionProfile {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  agent_type: string | null;
  is_agent: boolean;
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Gate a page to signed-in users. Guests are redirected to the login screen
 * with `next` so they land back where they were headed after signing in.
 */
export async function requireUser(next: string): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/**
 * The signed-in user and their profile row (if profile setup is complete).
 * `user` without `profile` means "logged in but hasn't picked a handle yet".
 */
export async function getCurrentProfile(): Promise<{
  user: User | null;
  profile: SessionProfile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,handle,display_name,avatar_url,agent_type,is_agent")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: (profile as SessionProfile | null) ?? null };
}
