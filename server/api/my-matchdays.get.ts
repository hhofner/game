import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

interface PlayerStat {
  minutes: number
  goals: number
  assists: number
  clean_sheet: boolean
  yellow: number
  red: number
  // Extended stats — present after the expanded_player_stats migration is applied
  key_passes: number
  shots_on_target: number
  tackles: number
  interceptions: number
  saves: number
}

// The current user's picks + stats per matchday, keyed by matchday number.
// Testing allows ?userId= to inspect a given user without a session.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  let userId = (cfg.public.appMode !== 'production' && getQuery(event).userId as string) || ''
  if (!userId) userId = (await getUserId(event)) ?? ''
  if (!userId) return {}

  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  const { data: sels } = await db
    .from('selections')
    .select('matchday_id, auto_filled, matchdays(number), selection_players(player_id, players(name, photo_url))')
    .eq('user_id', userId)

  const { data: scores } = await db
    .from('scores')
    .select('points, matchdays(number)')
    .eq('user_id', userId)

  const totalByNumber = new Map<number, number>()
  for (const s of (scores ?? []) as { points: number, matchdays: { number: number } | { number: number }[] | null }[]) {
    const n = one(s.matchdays)?.number
    if (n != null) totalByNumber.set(n, s.points)
  }

  // Fetch aggregated per-player stats for all matchdays this user has selections in
  const typedSels = (sels ?? []) as {
    matchday_id: string
    auto_filled: boolean
    matchdays: { number: number } | { number: number }[] | null
    selection_players: { player_id: string, players: { name: string, photo_url: string | null } | { name: string, photo_url: string | null }[] | null }[]
  }[]

  const matchdayIds = typedSels.map(s => s.matchday_id).filter(Boolean)
  const allPlayerIds = [...new Set(typedSels.flatMap(s => s.selection_players.map(sp => sp.player_id)))]
  const statsByKey = new Map<string, PlayerStat>()

  if (matchdayIds.length && allPlayerIds.length) {
    const { data: matchRows } = await db
      .from('matches')
      .select('id, matchday_id')
      .in('matchday_id', matchdayIds)

    const allMatchIds = (matchRows ?? []).map((m: { id: string }) => m.id)
    const matchToMd = new Map<string, string>((matchRows ?? []).map((m: { id: string, matchday_id: string }) => [m.id, m.matchday_id]))

    if (allMatchIds.length) {
      // Try full column list first; fall back to base columns if extended ones don't exist yet.
      let { data: statsRows, error: statsErr } = await db
        .from('player_match_stats')
        .select('player_id, match_id, minutes, goals, assists, clean_sheet, yellow, red, key_passes, shots_on_target, tackles, interceptions, saves')
        .in('match_id', allMatchIds)
        .in('player_id', allPlayerIds)
      if (statsErr) {
        const fallback = await db
          .from('player_match_stats')
          .select('player_id, match_id, minutes, goals, assists, clean_sheet, yellow, red')
          .in('match_id', allMatchIds)
          .in('player_id', allPlayerIds)
        statsRows = fallback.data
      }

      for (const s of (statsRows ?? []) as (PlayerStat & { player_id: string, match_id: string })[]) {
        const mdId = matchToMd.get(s.match_id)
        if (!mdId) continue
        const key = `${mdId}:${s.player_id}`
        const cur = statsByKey.get(key)
        if (!cur) {
          statsByKey.set(key, {
            minutes: s.minutes, goals: s.goals, assists: s.assists,
            clean_sheet: s.clean_sheet, yellow: s.yellow ?? 0, red: s.red ?? 0,
            key_passes: s.key_passes ?? 0, shots_on_target: s.shots_on_target ?? 0,
            tackles: s.tackles ?? 0, interceptions: s.interceptions ?? 0, saves: s.saves ?? 0
          })
        } else {
          cur.minutes += s.minutes
          cur.goals += s.goals
          cur.assists += s.assists
          cur.clean_sheet = cur.clean_sheet || s.clean_sheet
          cur.yellow += s.yellow ?? 0
          cur.red += s.red ?? 0
          cur.key_passes += s.key_passes ?? 0
          cur.shots_on_target += s.shots_on_target ?? 0
          cur.tackles += s.tackles ?? 0
          cur.interceptions += s.interceptions ?? 0
          cur.saves += s.saves ?? 0
        }
      }
    }
  }

  const result: Record<number, {
    autoFilled: boolean
    total: number | null
    players: { name: string, photo: string | null, stats: PlayerStat | null }[]
  }> = {}

  for (const sel of typedSels) {
    const number = one(sel.matchdays)?.number
    if (number == null) continue
    result[number] = {
      autoFilled: sel.auto_filled,
      total: totalByNumber.get(number) ?? null,
      players: sel.selection_players.map((sp) => {
        const pl = one(sp.players)
        return {
          name: pl?.name ?? 'Player',
          photo: pl?.photo_url ?? null,
          stats: statsByKey.get(`${sel.matchday_id}:${sp.player_id}`) ?? null
        }
      })
    }
  }
  return result
})
