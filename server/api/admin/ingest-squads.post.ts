import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

interface AfSquad {
  team: { id: number }
  players: { id: number, name: string, position: string | null, photo: string }[]
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
// API-Football uses "Attacker"; the app uses "Forward".
const normPos = (p: string | null) => (p === 'Attacker' ? 'Forward' : p)

// Ingest squads so the player pool exists BEFORE matches are played (needed
// pre-tournament — stats-based player ingestion only works post-match).
// Paced for the rate limit, resumable (skips teams that already have players).
// ?limit=N (teams per run), ?force=1 (refetch all).
export default defineEventHandler(async (event) => {
  assertAdmin(event)
  const limit = Math.max(1, Math.min(64, Number(getQuery(event).limit) || 40))
  const force = getQuery(event).force === '1'
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const af = apiFootball()

  async function fetchSquad(teamExtId: number) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await af.get<AfSquad[]>('/players/squads', { team: teamExtId })
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

  const { data: teams } = await db.from('teams').select('id, external_id')
  const { data: existing } = await db.from('players').select('team_id')
  const haveTeam = new Set((existing ?? []).map(p => p.team_id))
  const todo = (teams ?? []).filter(t => force || !haveTeam.has(t.id)).slice(0, limit)

  let players = 0
  for (let i = 0; i < todo.length; i++) {
    if (i > 0) await sleep(7000)
    const t = todo[i]!
    const { response } = await fetchSquad(t.external_id)
    const sq = response?.[0]
    if (!sq) continue
    const input = sq.players.map(p => ({
      external_id: p.id, team_id: t.id, name: p.name, position: normPos(p.position), photo_url: p.photo
    }))
    await db.from('players').upsert(input, { onConflict: 'external_id' })
    players += input.length
  }

  const remaining = (teams ?? []).filter(t => force || !haveTeam.has(t.id)).length - todo.length
  return { processedTeams: todo.length, remaining, players }
})
