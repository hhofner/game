import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

interface TeamRef { name: string, logo_url: string | null }
interface PlayerRow {
  id: string
  name: string
  photo_url: string | null
  position: string | null
  team: TeamRef | TeamRef[] | null
}
interface TotalRow { player_id: string, goals: number, assists: number, apps: number }

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

// Real player pool with team + tournament totals.
export default defineEventHandler(async (event) => {
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  const [{ data: players, error: pErr }, { data: totals, error: tErr }] = await Promise.all([
    db.from('players').select('id, name, photo_url, position, team:team_id(name, logo_url)'),
    db.from('player_totals').select('player_id, goals, assists, apps')
  ])
  if (pErr) throw createError({ statusCode: 500, statusMessage: pErr.message })
  if (tErr) throw createError({ statusCode: 500, statusMessage: tErr.message })

  const totalById = new Map<string, TotalRow>((totals as TotalRow[]).map(t => [t.player_id, t]))

  return (players as PlayerRow[])
    .map((p) => {
      const team = one(p.team)
      const t = totalById.get(p.id)
      return {
        id: p.id,
        name: p.name,
        photo: p.photo_url,
        position: p.position,
        nation: team?.name ?? null,
        teamLogo: team?.logo_url ?? null,
        goals: t?.goals ?? 0,
        assists: t?.assists ?? 0,
        apps: t?.apps ?? 0
      }
    })
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
})
