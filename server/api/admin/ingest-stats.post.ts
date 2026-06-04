import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

interface AfStat {
  games?: { minutes?: number | null }
  goals?: { total?: number | null, conceded?: number | null, assists?: number | null }
  cards?: { yellow?: number | null, red?: number | null }
}
interface AfTeamPlayers {
  team: { id: number }
  players: { player: { id: number, name: string, photo: string }, statistics: AfStat[] }[]
}

// Ingest per-player match stats for finished fixtures, in chunks. Idempotent +
// resumable: skips fixtures already ingested. Testing-mode only.
// POST /api/admin/ingest-stats?limit=12
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Ingestion disabled in production' })
  }

  const limit = Math.max(1, Math.min(80, Number(getQuery(event).limit) || 12))
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const af = apiFootball()

  // Free plan is ~10 req/min, so pace calls and back off on 429.
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  async function fetchPlayers(fixtureId: number) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await af.get<AfTeamPlayers[]>('/fixtures/players', { fixture: fixtureId })
      } catch (e) {
        const code = (e as { statusCode?: number, status?: number }).statusCode
          ?? (e as { status?: number }).status
        if (code === 429 && attempt < 4) {
          await sleep(20000)
          continue
        }
        throw e
      }
    }
  }

  // Teams map (api id -> our uuid)
  const { data: teamRows } = await db.from('teams').select('id, external_id')
  const teamId = new Map<number, string>((teamRows ?? []).map(r => [r.external_id, r.id]))

  // Finished matches missing stats
  // Finished = full-time, after-extra-time, or penalties
  const { data: ftMatches } = await db.from('matches').select('id, external_id').in('status', ['FT', 'AET', 'PEN'])
  const { data: doneRows } = await db.from('player_match_stats').select('match_id')
  const done = new Set((doneRows ?? []).map(r => r.match_id))
  const pending = (ftMatches ?? []).filter(m => !done.has(m.id))
  const batch = pending.slice(0, limit)

  let players = 0
  let stats = 0
  for (let i = 0; i < batch.length; i++) {
    if (i > 0) await sleep(7000) // stay under the per-minute limit
    const m = batch[i]
    if (!m) continue
    const { response } = await fetchPlayers(m.external_id)

    // Upsert players for this fixture
    const playerInput = response.flatMap(t =>
      t.players.map(p => ({
        external_id: p.player.id,
        team_id: teamId.get(t.team.id) ?? null,
        name: p.player.name,
        photo_url: p.player.photo
      }))
    )
    const { data: pRows, error: pErr } = await db
      .from('players')
      .upsert(playerInput, { onConflict: 'external_id' })
      .select('id, external_id')
    if (pErr) throw createError({ statusCode: 500, statusMessage: `players: ${pErr.message}` })
    const pid = new Map<number, string>((pRows ?? []).map(r => [r.external_id, r.id]))
    players += pRows?.length ?? 0

    // Stats rows
    const statInput = response.flatMap(t =>
      t.players.map((p) => {
        const st = p.statistics?.[0] ?? {}
        const minutes = st.games?.minutes ?? 0
        return {
          player_id: pid.get(p.player.id),
          match_id: m.id,
          minutes,
          goals: st.goals?.total ?? 0,
          assists: st.goals?.assists ?? 0,
          clean_sheet: (st.goals?.conceded ?? 1) === 0 && minutes > 0,
          yellow: st.cards?.yellow ?? 0,
          red: st.cards?.red ?? 0,
          raw: st
        }
      }).filter(r => r.player_id)
    )
    const { error: sErr } = await db
      .from('player_match_stats')
      .upsert(statInput, { onConflict: 'player_id,match_id' })
    if (sErr) throw createError({ statusCode: 500, statusMessage: `stats: ${sErr.message}` })
    stats += statInput.length
  }

  return {
    processed: batch.length,
    remaining: pending.length - batch.length,
    players,
    stats
  }
})
