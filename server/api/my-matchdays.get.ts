import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

// The current user's picks + points per matchday, keyed by matchday number.
// Testing allows ?userId= to inspect a given user without a session.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  let userId = (cfg.public.appMode !== 'production' && getQuery(event).userId as string) || ''
  if (!userId) userId = (await getUserId(event)) ?? ''
  if (!userId) return {}

  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  const { data: sels } = await db
    .from('selections')
    .select('auto_filled, matchdays(number), selection_players(player_id, players(name, photo_url))')
    .eq('user_id', userId)
  const { data: pts } = await db
    .from('player_points')
    .select('player_id, points, matchdays(number)')
    .eq('user_id', userId)
  const { data: scores } = await db
    .from('scores')
    .select('points, matchdays(number)')
    .eq('user_id', userId)

  const pointByKey = new Map<string, number>()
  for (const p of (pts ?? []) as { player_id: string, points: number, matchdays: { number: number } | { number: number }[] | null }[]) {
    pointByKey.set(`${one(p.matchdays)?.number}:${p.player_id}`, p.points)
  }
  const totalByNumber = new Map<number, number>()
  for (const s of (scores ?? []) as { points: number, matchdays: { number: number } | { number: number }[] | null }[]) {
    const n = one(s.matchdays)?.number
    if (n != null) totalByNumber.set(n, s.points)
  }

  const result: Record<number, { autoFilled: boolean, total: number | null, players: { name: string, photo: string | null, points: number | null }[] }> = {}
  for (const sel of (sels ?? []) as { auto_filled: boolean, matchdays: { number: number } | { number: number }[] | null, selection_players: { player_id: string, players: { name: string, photo_url: string | null } | { name: string, photo_url: string | null }[] | null }[] }[]) {
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
          points: pointByKey.get(`${number}:${sp.player_id}`) ?? null
        }
      })
    }
  }
  return result
})
