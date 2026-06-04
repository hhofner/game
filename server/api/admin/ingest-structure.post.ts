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

// Ingest the tournament structure (teams, matchdays, matches) for the active
// season in ONE API-Football call. Testing-mode only. Idempotent (upserts).
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Ingestion disabled in production' })
  }

  // Database types aren't generated yet, so use a loosely-typed client.
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const af = apiFootball()
  const season = wcSeason()

  const { response: fixtures } = await af.get<AfFixture[]>('/fixtures', { league: WC_LEAGUE_ID, season })
  if (!fixtures?.length) {
    throw createError({ statusCode: 502, statusMessage: `No fixtures for season ${season}` })
  }

  // 1) Teams (deduped from both sides of every fixture)
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

  // 2) Matchdays (from distinct rounds)
  const mds = new Map<number, { number: number, label: string, type: string }>()
  for (const fx of fixtures) {
    const m = mapRound(fx.league?.round ?? '')
    if (m) mds.set(m.number, { number: m.number, label: m.label, type: m.type })
  }
  const { data: mdRows, error: mdErr } = await db
    .from('matchdays')
    .upsert([...mds.values()], { onConflict: 'number' })
    .select('id, number')
  if (mdErr) throw createError({ statusCode: 500, statusMessage: `matchdays: ${mdErr.message}` })
  const mdId = new Map<number, string>((mdRows ?? []).map(r => [r.number, r.id]))

  // 3) Matches
  const matches = fixtures.flatMap((fx) => {
    const m = mapRound(fx.league?.round ?? '')
    if (!m) return []
    return [{
      external_id: fx.fixture.id,
      matchday_id: mdId.get(m.number),
      home_team_id: teamId.get(fx.teams.home.id) ?? null,
      away_team_id: teamId.get(fx.teams.away.id) ?? null,
      kickoff_at: fx.fixture.date,
      status: fx.fixture.status?.short ?? 'NS',
      home_score: fx.goals?.home ?? null,
      away_score: fx.goals?.away ?? null
    }]
  })
  const { error: matchErr } = await db.from('matches').upsert(matches, { onConflict: 'external_id' })
  if (matchErr) throw createError({ statusCode: 500, statusMessage: `matches: ${matchErr.message}` })

  return { season, teams: teams.size, matchdays: mds.size, matches: matches.length }
})
