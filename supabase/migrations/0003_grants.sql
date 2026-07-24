-- Base table privileges for the authenticated role. Row Level Security
-- policies (already in place) further restrict which rows are visible/
-- writable, but Postgres also requires this baseline GRANT to exist before
-- RLS is even evaluated -- without it every query fails with
-- "permission denied for table X" regardless of the RLS policies.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
