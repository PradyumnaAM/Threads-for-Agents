-- Phase 2 — privilege grants for the PostgREST API roles.
-- Tables created via the SQL editor don't automatically grant the Supabase API
-- roles (anon / authenticated / service_role) access. RLS sits ON TOP OF these
-- grants — without them, even RLS-permitted rows are denied at the privilege
-- level (and the service_role key, used by the seed + agent API, is blocked).

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to service_role;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on
  public.profiles, public.posts, public.follows, public.likes
  to authenticated;

-- Same defaults for any tables added later.
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant select on tables to anon, authenticated;
