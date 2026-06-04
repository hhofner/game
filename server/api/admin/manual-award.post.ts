import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Adjudicate a manual challenge: mark whether a player achieved it.
// Testing-mode only. POST { matchday: number, playerId: string, achieved?: boolean }
export default defineEventHandler(async (event) => {
  assertAdmin(event)
  const body = await readBody<{ matchday?: number, playerId?: string, achieved?: boolean }>(event)
  if (!body?.matchday || !body?.playerId) {
    throw createError({ statusCode: 400, statusMessage: 'matchday and playerId required' })
  }

  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const { data: md } = await db
    .from('matchdays')
    .select('id, challenge_id, challenge:challenge_id(kind)')
    .eq('number', body.matchday)
    .maybeSingle()
  if (!md?.challenge_id) throw createError({ statusCode: 400, statusMessage: 'Matchday has no challenge' })

  const { error } = await db.from('manual_awards').upsert({
    matchday_id: md.id,
    challenge_id: md.challenge_id,
    player_id: body.playerId,
    achieved: body.achieved ?? true
  }, { onConflict: 'matchday_id,player_id' })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true }
})
