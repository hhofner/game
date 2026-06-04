import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

// Record that the user has seen results up to a matchday number.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  let userId = (cfg.public.appMode !== 'production' && getQuery(event).userId as string) || ''
  if (!userId) {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    userId = user.id
  }

  const body = await readBody<{ matchday?: number }>(event)
  const matchday = Number(body?.matchday)
  if (!matchday) throw createError({ statusCode: 400, statusMessage: 'matchday required' })

  await db.from('profiles').update({ last_seen_matchday: matchday }).eq('id', userId)
  return { ok: true }
})
