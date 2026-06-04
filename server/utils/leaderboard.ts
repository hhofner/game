import type { SupabaseClient } from '@supabase/supabase-js'

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

interface ScoreRow { user_id: string, points: number, matchdays: { number: number } | { number: number }[] | null }
interface Profile { id: string, username: string, avatar_url: string | null }

export interface Standing {
  rank: number
  userId: string
  username: string
  avatar: string | null
  points: number
}

// Cumulative standings up through a matchday number (null = latest).
export async function cumulativeStandings(db: SupabaseClient, through?: number | null) {
  const { data: scores } = await db.from('scores').select('user_id, points, matchdays(number)')
  const withN = ((scores ?? []) as ScoreRow[]).map(r => ({
    user_id: r.user_id,
    points: r.points,
    number: one(r.matchdays)?.number ?? 0
  }))

  const maxMatchday = withN.reduce((m, r) => Math.max(m, r.number), 0)
  const cut = through == null ? maxMatchday : Math.min(through, maxMatchday)

  const totals = new Map<string, number>()
  for (const r of withN) {
    if (r.number <= cut) totals.set(r.user_id, (totals.get(r.user_id) ?? 0) + r.points)
  }

  const { data: profs } = await db.from('profiles').select('id, username, avatar_url')
  const profById = new Map<string, Profile>((profs ?? []).map((p: Profile) => [p.id, p]))

  const standings: Standing[] = [...totals.entries()]
    .map(([userId, points]) => ({
      userId,
      username: profById.get(userId)?.username ?? 'Player',
      avatar: profById.get(userId)?.avatar_url ?? null,
      points
    }))
    .sort((a, b) => b.points - a.points)
    .map((r, i) => ({ rank: i + 1, ...r }))

  return { through: cut, maxMatchday, standings }
}

// Highest matchday number the user has a score in.
export async function maxScoredMatchday(db: SupabaseClient, userId: string) {
  const { data } = await db.from('scores').select('matchdays(number)').eq('user_id', userId)
  return ((data ?? []) as { matchdays: { number: number } | { number: number }[] | null }[])
    .reduce((m, r) => Math.max(m, one(r.matchdays)?.number ?? 0), 0)
}
