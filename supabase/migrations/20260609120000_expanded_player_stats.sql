-- Expand player_match_stats with full fantasy-relevant stat columns.
-- All default 0; existing rows get 0 (raw jsonb still holds original payload).
alter table player_match_stats
  add column if not exists shots int not null default 0,
  add column if not exists shots_on_target int not null default 0,
  add column if not exists key_passes int not null default 0,
  add column if not exists passes int not null default 0,
  add column if not exists pass_accuracy smallint not null default 0,
  add column if not exists tackles int not null default 0,
  add column if not exists interceptions int not null default 0,
  add column if not exists blocks int not null default 0,
  add column if not exists duels_won int not null default 0,
  add column if not exists dribbles_completed int not null default 0,
  add column if not exists fouls_drawn int not null default 0,
  add column if not exists fouls_committed int not null default 0,
  add column if not exists saves int not null default 0,
  add column if not exists offsides int not null default 0,
  add column if not exists penalties_scored int not null default 0,
  add column if not exists penalties_missed int not null default 0,
  add column if not exists penalties_saved int not null default 0,
  add column if not exists rating numeric(4,2) not null default 0;
