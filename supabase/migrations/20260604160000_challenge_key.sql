-- Stable key for idempotent challenge seeding.
alter table challenges add column if not exists key text;
create unique index if not exists challenges_key_idx on challenges(key);
