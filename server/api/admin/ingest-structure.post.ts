import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

interface AfFixture {
  fixture: { id: number, date: string, status: { short: string } }
  league: { round: string }
  teams: {
    home: { id: number, name: string, logo: string }
    away: { id: number, name: string, logo: string }
  }
  goals: { home: number | null, away: number | null }
}

interface MatchdayAcc {
  natural_key: string
  label: string
  type: 'early' | 'late'
  starts_at: string
  ends_at: string
}

// Early-round matchdays are per calendar day (UTC); late-round matchdays are
// per round. Numbered chronologically.
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'
  })
}

// Ingest tournament structure (teams, matchdays, matches) in ONE API-Football
// call. Testing-mode only. Idempotent (upserts on natural keys).
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Ingestion disabled in production' })
  }

  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const af = apiFootball()
  const season = wcSeason()

  const { response: fixtures } = await af.get<AfFixture[]>('/fixtures', { league: WC_LEAGUE_ID, season })
  if (!fixtures?.length) {
    throw createError({ statusCode: 502, statusMessage: `No fixtures for season ${season}` })
  }

  // 1) Teams
  const teams = new Map<number, { external_id: number, name: string, logo_url: string }>()
  for (const fx of fixtures) {
    for (const side of ['home', 'away'] as const) {
      const t = fx.teams?.[side]
      if (t?.id) teams.set(t.id, { external_id: t.id, name: t.name, logo_url: t.logo })
    }
  }
  const { data: teamRows, error: teamErr } = await db
    .from('teams')
    .upsert([...teams.values()], { onConflict: 'external_id' })
    .select('id, external_id')
  if (teamErr) throw createError({ statusCode: 500, statusMessage: `teams: ${teamErr.message}` })
  const teamId = new Map<number, string>((teamRows ?? []).map(r => [r.external_id, r.id]))

  // 2) Matchdays — group early fixtures by date, late fixtures by round
  const mdByKey = new Map<string, MatchdayAcc>()
  const fixtureKey = new Map<number, string>()
  for (const fx of fixtures) {
    const { phase, roundLabel } = classifyRound(fx.league?.round ?? '')
    const date = fx.fixture.date
    const key = phase === 'early' ? `d:${date.slice(0, 10)}` : `r:${roundLabel}`
    fixtureKey.set(fx.fixture.id, key)

    const acc = mdByKey.get(key)
    if (!acc) {
      mdByKey.set(key, {
        natural_key: key,
        label: phase === 'early' ? fmtDate(date) : roundLabel!,
        type: phase,
        starts_at: date,
        ends_at: date
      })
    } else {
      if (date < acc.starts_at) acc.starts_at = date
      if (date > acc.ends_at) acc.ends_at = date
    }
  }

  // Number chronologically by start
  const ordered = [...mdByKey.values()].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  const mdInput = ordered.map((m, i) => ({ ...m, number: i + 1 }))

  const { data: mdRows, error: mdErr } = await db
    .from('matchdays')
    .upsert(mdInput, { onConflict: 'natural_key' })
    .select('id, natural_key')
  if (mdErr) throw createError({ statusCode: 500, statusMessage: `matchdays: ${mdErr.message}` })
  const mdId = new Map<string, string>((mdRows ?? []).map(r => [r.natural_key, r.id]))

  // 3) Matches
  const matches = fixtures.map(fx => ({
    external_id: fx.fixture.id,
    matchday_id: mdId.get(fixtureKey.get(fx.fixture.id) ?? '') ?? null,
    home_team_id: teamId.get(fx.teams.home.id) ?? null,
    away_team_id: teamId.get(fx.teams.away.id) ?? null,
    kickoff_at: fx.fixture.date,
    status: fx.fixture.status?.short ?? 'NS',
    home_score: fx.goals?.home ?? null,
    away_score: fx.goals?.away ?? null
  }))
  const { error: matchErr } = await db.from('matches').upsert(matches, { onConflict: 'external_id' })
  if (matchErr) throw createError({ statusCode: 500, statusMessage: `matches: ${matchErr.message}` })

  return { season, teams: teams.size, matchdays: mdInput.length, matches: matches.length }
})
