import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

const toModalRow = (s: { rank: number, userId: string, username: string, avatar: string | null, points: number }, meId: string) => ({
  rank: s.rank,
  name: s.username,
  avatar: s.avatar,
  points: s.points,
  isYou: s.userId === meId
})

// The most recent finished matchday whose results the user hasn't seen, shaped
// for MatchdayResultsModal (previous + next standings). null if nothing unseen.
// Testing mode allows ?userId= to inspect a given user without a session.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  let userId = (cfg.public.appMode !== 'production' && getQuery(event).userId as string) || ''
  if (!userId) {
    userId = (await getUserId(event)) ?? ''
    if (!userId) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const { data: prof } = await db.from('profiles').select('last_seen_matchday').eq('id', userId).maybeSingle()
  const lastSeen = prof?.last_seen_matchday ?? 0

  const latest = await maxScoredMatchday(db, userId)
  // Need a prior matchday to animate a rank change.
  if (latest <= lastSeen || latest < 2) return null

  const [prev, next] = await Promise.all([
    cumulativeStandings(db, latest - 1),
    cumulativeStandings(db, latest)
  ])
  const prevRank = prev.standings.find(s => s.userId === userId)?.rank
  const nextRank = next.standings.find(s => s.userId === userId)?.rank
  // Only animate when the user actually moved up or down.
  if (prevRank == null || nextRank == null || prevRank === nextRank) return null

  return {
    matchday: latest,
    direction: nextRank < prevRank ? 'up' : 'down',
    previous: prev.standings.map(s => toModalRow(s, userId)),
    next: next.standings.map(s => toModalRow(s, userId))
  }
})
