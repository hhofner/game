import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// The current user's selection for the current matchday.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const db = await serverSupabaseClient(event) as unknown as SupabaseClient
  const md = await currentMatchday(db)
  if (!md) return { matchday: null, players: [] }

  const { data: sel } = await db
    .from('selections')
    .select('id, auto_filled, selection_players(player_id)')
    .eq('user_id', user.id)
    .eq('matchday_id', md.id)
    .maybeSingle()

  const ids: string[] = (sel?.selection_players ?? []).map((r: { player_id: string }) => r.player_id)
  const players = ids.length ? await getPlayers(db, ids) : []
  const byId = new Map(players.map(p => [p.id, p]))

  return {
    matchday: md,
    autoFilled: sel?.auto_filled ?? false,
    players: ids.map(id => byId.get(id)).filter(Boolean)
  }
})
