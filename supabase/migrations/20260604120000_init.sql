-- WC2026 game — initial schema
-- Apply with `supabase db push` (or paste into the Supabase SQL editor).

create extension if not exists pgcrypto;

-- ============================================================
-- Reference data (synced from SportMonks; writes via service role)
-- ============================================================

create table teams (
  id uuid primary key default gen_random_uuid(),
  external_id bigint unique,
  name text not null,
  code text,
  flag_code text,
  logo_url text,
  group_label text,
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  external_id bigint unique,
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  position text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Authored challenge pool (not synced). Randomly assigned to matchdays by tier.
create table challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  criteria text[] not null default '{}',
  tier text not null check (tier in ('early', 'late')),
  kind text not null check (kind in ('stat', 'manual')),
  metric jsonb,
  scoring_rules jsonb not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table matchdays (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  label text not null,
  type text not null check (type in ('group', 'knockout')),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'finished')),
  challenge_id uuid references challenges(id),
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  external_id bigint unique,
  matchday_id uuid not null references matchdays(id) on delete cascade,
  home_team_id uuid references teams(id),
  away_team_id uuid references teams(id),
  kickoff_at timestamptz,
  status text not null default 'upcoming',
  home_score int,
  away_score int
);

create table player_match_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  minutes int not null default 0,
  goals int not null default 0,
  assists int not null default 0,
  clean_sheet boolean not null default false,
  yellow int not null default 0,
  red int not null default 0,
  raw jsonb, -- full SportMonks per-player payload so any stat is queryable
  unique (player_id, match_id)
);

-- ============================================================
-- User data (RLS: owner read/write)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  last_seen_matchday int not null default 0,
  created_at timestamptz not null default now()
);

create table selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  matchday_id uuid not null references matchdays(id) on delete cascade,
  auto_filled boolean not null default false,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, matchday_id)
);

create table selection_players (
  selection_id uuid not null references selections(id) on delete cascade,
  player_id uuid not null references players(id),
  primary key (selection_id, player_id)
);

-- ============================================================
-- Derived (owned by the scoring engine; writes via service role)
-- ============================================================

create table player_points (
  user_id uuid not null references profiles(id) on delete cascade,
  matchday_id uuid not null references matchdays(id) on delete cascade,
  player_id uuid not null references players(id),
  points int not null default 0,
  primary key (user_id, matchday_id, player_id)
);

create table scores (
  user_id uuid not null references profiles(id) on delete cascade,
  matchday_id uuid not null references matchdays(id) on delete cascade,
  points int not null default 0,
  computed_at timestamptz not null default now(),
  primary key (user_id, matchday_id)
);

-- Admin adjudication for `manual` challenges
create table manual_awards (
  id uuid primary key default gen_random_uuid(),
  matchday_id uuid not null references matchdays(id) on delete cascade,
  challenge_id uuid not null references challenges(id),
  player_id uuid not null references players(id),
  achieved boolean not null default false,
  awarded_by uuid references auth.users(id),
  note text,
  created_at timestamptz not null default now(),
  unique (matchday_id, player_id)
);

-- ============================================================
-- Constraints / triggers
-- ============================================================

-- Cap a selection at 3 players
create or replace function enforce_max_three_picks()
returns trigger language plpgsql as $$
begin
  if (select count(*) from selection_players where selection_id = new.selection_id) >= 3 then
    raise exception 'A selection can have at most 3 players';
  end if;
  return new;
end;
$$;

create trigger trg_max_three_picks
before insert on selection_players
for each row execute function enforce_max_three_picks();

-- Create a profile row on signup (username from metadata or email local-part)
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ============================================================
-- Leaderboard view (cumulative across matchdays)
-- ============================================================

create view leaderboard as
select
  s.user_id,
  p.username,
  p.avatar_url,
  sum(s.points)::int as total_points
from scores s
join profiles p on p.id = s.user_id
group by s.user_id, p.username, p.avatar_url;

-- ============================================================
-- Row Level Security
-- ============================================================

-- Reference + derived: public read, writes only via service role (bypasses RLS)
alter table teams enable row level security;
alter table players enable row level security;
alter table matchdays enable row level security;
alter table matches enable row level security;
alter table challenges enable row level security;
alter table player_match_stats enable row level security;
alter table manual_awards enable row level security;
alter table scores enable row level security;
alter table player_points enable row level security;

create policy "read teams" on teams for select using (true);
create policy "read players" on players for select using (true);
create policy "read matchdays" on matchdays for select using (true);
create policy "read matches" on matches for select using (true);
create policy "read challenges" on challenges for select using (true);
create policy "read player_match_stats" on player_match_stats for select using (true);
create policy "read manual_awards" on manual_awards for select using (true);
create policy "read scores" on scores for select using (true);
create policy "read player_points" on player_points for select using (true);

-- Profiles: everyone can read (leaderboard), only owner can update
alter table profiles enable row level security;
create policy "read profiles" on profiles for select using (true);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- Selections: owner full access.
-- TODO: block writes once selections.locked_at is set (add a check in the policy).
alter table selections enable row level security;
create policy "own selections" on selections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table selection_players enable row level security;
create policy "own selection_players" on selection_players for all
  using (exists (select 1 from selections s where s.id = selection_id and s.user_id = auth.uid()))
  with check (exists (select 1 from selections s where s.id = selection_id and s.user_id = auth.uid()));
