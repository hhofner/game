import type { SupabaseClient } from '@supabase/supabase-js'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

interface AfFixture {
  fixture: { id: number, date: string, status: { short: string } }
  league: { round: string }
  teams: {
    home: { id: number, name: string, logo: string }
    away: { id: number, name: string, logo: string }
  }
  goals: { home: number | null, away: number | null }
}
interface AfStat {
  games?: { minutes?: number | null }
  goals?: { total?: number | null, conceded?: number | null, assists?: number | null }
  cards?: { yellow?: number | null, red?: number | null }
}
interface AfTeamPlayers {
  team: { id: number }
  players: { player: { id: number, name: string, photo: string }, statistics: AfStat[] }[]
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

// Teams + date/round matchdays + matches, in one API-Football call. Idempotent.
export async function ingestStructure(db: SupabaseClient) {
  const af = apiFootball()
  const season = wcSeason()
  const { response: fixtures } = await af.get<AfFixture[]>('/fixtures', { league: WC_LEAGUE_ID, season })
  if (!fixtures?.length) throw createError({ statusCode: 502, statusMessage: `No fixtures for season ${season}` })

  const teams = new Map<number, { external_id: number, name: string, logo_url: string }>()
  for (const fx of fixtures) {
    for (const side of ['home', 'away'] as const) {
      const t = fx.teams?.[side]
      if (t?.id) teams.set(t.id, { external_id: t.id, name: t.name, logo_url: t.logo })
    }
  }
  const { data: teamRows } = await db.from('teams').upsert([...teams.values()], { onConflict: 'external_id' }).select('id, external_id')
  const teamId = new Map<number, string>((teamRows ?? []).map(r => [r.external_id, r.id]))

  const mdByKey = new Map<string, { natural_key: string, label: string, type: string, starts_at: string, ends_at: string }>()
  const fixtureKey = new Map<number, string>()
  for (const fx of fixtures) {
    const { phase, roundLabel } = classifyRound(fx.league?.round ?? '')
    const date = fx.fixture.date
    const key = phase === 'early' ? `d:${date.slice(0, 10)}` : `r:${roundLabel}`
    fixtureKey.set(fx.fixture.id, key)
    const acc = mdByKey.get(key)
    if (!acc) {
      mdByKey.set(key, { natural_key: key, label: phase === 'early' ? fmtDate(date) : roundLabel!, type: phase, starts_at: date, ends_at: date })
    } else {
      if (date < acc.starts_at) acc.starts_at = date
      if (date > acc.ends_at) acc.ends_at = date
    }
  }
  const ordered = [...mdByKey.values()].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  const { data: mdRows } = await db.from('matchdays').upsert(ordered.map((m, i) => ({ ...m, number: i + 1 })), { onConflict: 'natural_key' }).select('id, natural_key')
  const mdId = new Map<string, string>((mdRows ?? []).map(r => [r.natural_key, r.id]))

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
  await db.from('matches').upsert(matches, { onConflict: 'external_id' })

  return { season, teams: teams.size, matchdays: ordered.length, matches: matches.length }
}

// Per-player stats for finished fixtures missing them, paced for the rate limit.
export async function ingestStats(db: SupabaseClient, limit = 12) {
  const af = apiFootball()
  async function fetchPlayers(fixtureId: number) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await af.get<AfTeamPlayers[]>('/fixtures/players', { fixture: fixtureId })
      } catch (e) {
        const code = (e as { statusCode?: number, status?: number }).statusCode ?? (e as { status?: number }).status
        if (code === 429 && attempt < 4) {
          await sleep(20000)
          continue
        }
        throw e
      }
    }
  }

  const { data: teamRows } = await db.from('teams').select('id, external_id')
  const teamId = new Map<number, string>((teamRows ?? []).map(r => [r.external_id, r.id]))
  const { data: ftMatches } = await db.from('matches').select('id, external_id').in('status', ['FT', 'AET', 'PEN'])
  const { data: doneRows } = await db.from('player_match_stats').select('match_id')
  const done = new Set((doneRows ?? []).map(r => r.match_id))
  const pending = (ftMatches ?? []).filter(m => !done.has(m.id))
  const batch = pending.slice(0, limit)

  let players = 0
  let stats = 0
  for (let i = 0; i < batch.length; i++) {
    if (i > 0) await sleep(7000)
    const m = batch[i]
    if (!m) continue
    const { response } = await fetchPlayers(m.external_id)
    const playerInput = response.flatMap(t => t.players.map(p => ({
      external_id: p.player.id, team_id: teamId.get(t.team.id) ?? null, name: p.player.name, photo_url: p.player.photo
    })))
    const { data: pRows } = await db.from('players').upsert(playerInput, { onConflict: 'external_id' }).select('id, external_id')
    const pid = new Map<number, string>((pRows ?? []).map(r => [r.external_id, r.id]))
    players += pRows?.length ?? 0
    const statInput = response.flatMap(t => t.players.map((p) => {
      const st = p.statistics?.[0] ?? {}
      const minutes = st.games?.minutes ?? 0
      return {
        player_id: pid.get(p.player.id), match_id: m.id, minutes,
        goals: st.goals?.total ?? 0, assists: st.goals?.assists ?? 0,
        clean_sheet: (st.goals?.conceded ?? 1) === 0 && minutes > 0,
        yellow: st.cards?.yellow ?? 0, red: st.cards?.red ?? 0, raw: st
      }
    }).filter(r => r.player_id))
    await db.from('player_match_stats').upsert(statInput, { onConflict: 'player_id,match_id' })
    stats += statInput.length
  }
  return { processed: batch.length, remaining: pending.length - batch.length, players, stats }
}
