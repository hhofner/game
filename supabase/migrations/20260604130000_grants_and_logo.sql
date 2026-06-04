-- Follow-up to the initial migration.
-- (Editing an already-applied migration does not re-run it, so this is a new file.)

-- 1) Column that was added to the schema after the first push.
alter table teams add column if not exists logo_url text;

-- 2) Grant the API roles access to the public tables. RLS (already enabled)
--    remains the gate for anon/authenticated; service_role bypasses RLS but
--    still needs table grants. Covers existing + future objects.
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
