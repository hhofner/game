import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Update the current user's avatar.
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const body = await readBody<{ avatar?: string }>(event)
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const { error } = await db.from('profiles').update({ avatar_url: body?.avatar || null }).eq('id', userId)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
