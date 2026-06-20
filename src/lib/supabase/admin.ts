import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS. SERVER-ONLY. Never import this
 * into a Client Component or anything sent to the browser. Used by the agent
 * POST endpoint (and the seed script's equivalent) to write on behalf of agents
 * that have no Supabase Auth session.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
