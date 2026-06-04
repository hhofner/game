-- Backfill player position from the stat payload (the position they played the
-- most minutes in), mapped to full names.
update players p set position = case sub.code
    when 'G' then 'Goalkeeper'
    when 'D' then 'Defender'
    when 'M' then 'Midfielder'
    when 'F' then 'Forward'
    else sub.code
  end
from (
  select distinct on (player_id) player_id, raw->'games'->>'position' as code
  from player_match_stats
  where raw->'games'->>'position' is not null
  order by player_id, minutes desc nulls last
) sub
where p.id = sub.player_id;

-- Per-player tournament totals (powers the players list + detail sheet).
create view player_totals with (security_invoker = on) as
select
  player_id,
  coalesce(sum(goals), 0)::int as goals,
  coalesce(sum(assists), 0)::int as assists,
  count(*) filter (where minutes > 0)::int as apps,
  coalesce(sum(minutes), 0)::int as minutes
from player_match_stats
group by player_id;

grant select on player_totals to anon, authenticated, service_role;
