import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

interface ScoreRow { user_id: string, points: number, matchdays: { number: number } | { number: number }[] | null }
interface Profile { id: string, username: string, avatar_url: string | null }

// Cumulative standings up through a matchday number (?through=N; default latest).
export default defineEventHandler(async (event) => {
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  const { data: scores } = await db.from('scores').select('user_id, points, matchdays(number)')
  const rows = (scores ?? []) as ScoreRow[]
  const withN = rows.map(r => ({ user_id: r.user_id, points: r.points, number: one(r.matchdays)?.number ?? 0 }))

  const maxMatchday = withN.reduce((m, r) => Math.max(m, r.number), 0)
  const through = Math.min(Number(getQuery(event).through) || maxMatchday, maxMatchday)

  const totals = new Map<string, number>()
  for (const r of withN) {
    if (r.number <= through) totals.set(r.user_id, (totals.get(r.user_id) ?? 0) + r.points)
  }

  const { data: profs } = await db.from('profiles').select('id, username, avatar_url')
  const profById = new Map<string, Profile>((profs ?? []).map((p: Profile) => [p.id, p]))

  const standings = [...totals.entries()]
    .map(([userId, points]) => ({
      userId,
      username: profById.get(userId)?.username ?? 'Player',
      avatar: profById.get(userId)?.avatar_url ?? null,
      points
    }))
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ rank: i + 1, ...r }))

  return { through, maxMatchday, standings }
})
