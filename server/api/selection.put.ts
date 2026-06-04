import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// Replace the user's selection for the current matchday (up to 3 players).
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const db = await serverSupabaseClient(event) as unknown as SupabaseClient
  const md = await currentMatchday(db)
  if (!md) throw createError({ statusCode: 400, statusMessage: 'No active matchday' })

  const body = await readBody<{ playerIds?: string[] }>(event)
  const playerIds = Array.isArray(body?.playerIds) ? body.playerIds.slice(0, 3) : []

  // Upsert the selection row
  const { data: selRow, error: selErr } = await db
    .from('selections')
    .upsert({ user_id: user.id, matchday_id: md.id }, { onConflict: 'user_id,matchday_id' })
    .select('id')
    .single()
  if (selErr) throw createError({ statusCode: 500, statusMessage: selErr.message })

  // Replace its players
  await db.from('selection_players').delete().eq('selection_id', selRow.id)
  if (playerIds.length) {
    const { error } = await db
      .from('selection_players')
      .insert(playerIds.map(player_id => ({ selection_id: selRow.id, player_id })))
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true, matchdayId: md.id, count: playerIds.length }
})
