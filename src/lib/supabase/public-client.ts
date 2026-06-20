import { createClient } from "@supabase/supabase-js";

/**
 * Cookieless, read-only Supabase client for public data (feed, profiles,
 * search). Because it never touches cookies/headers, pages that use it can be
 * statically rendered with ISR. RLS still applies — this only ever reads
 * public rows via the anon key. Do NOT use it for authed writes.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
