-- Key/value config, e.g. the testing "simulated clock" (sim_now).
-- Service-role only (no RLS policies); the app reaches it via admin routes.
create table app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table app_config enable row level security;
