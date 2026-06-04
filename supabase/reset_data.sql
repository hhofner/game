-- Wipe game DATA for the testing -> production reset (keeps the schema).
-- Run with `supabase db execute` or in the SQL editor, BEFORE re-ingesting 2026.
-- NOTE: this does not delete auth users. Delete the seeded bot accounts
-- (bot1..bot6@wc.test) via the Auth admin API separately; real accounts are kept
-- and just have their progress reset.

truncate
  teams,
  players,
  matchdays,
  matches,
  player_match_stats,
  challenges,
  selections,
  selection_players,
  player_points,
  scores,
  manual_awards,
  app_config
cascade;

-- Reset returning-user state for kept accounts.
update profiles set last_seen_matchday = 0;
