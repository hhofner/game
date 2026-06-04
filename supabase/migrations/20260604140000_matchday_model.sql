-- Rework matchdays:
--   early rounds (group stage, round of 32, round of 16) -> one matchday per DATE
--   late rounds  (quarter-finals, semi-finals, final)    -> one matchday per ROUND
-- `type` now holds the challenge phase: 'early' | 'late'.
-- `natural_key` is the stable upsert key (a date for early, a round name for late).

-- Allow rebuilding: detach matches, drop old (round-based) matchdays.
alter table matches alter column matchday_id drop not null;
update matches set matchday_id = null;
delete from matchdays;

alter table matchdays drop constraint if exists matchdays_type_check;
alter table matchdays add constraint matchdays_type_check check (type in ('early', 'late'));

alter table matchdays add column if not exists natural_key text;
create unique index if not exists matchdays_natural_key_idx on matchdays(natural_key);
