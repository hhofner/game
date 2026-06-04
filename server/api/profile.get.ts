import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// The current user's profile (username + chosen avatar).
export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const { data } = await db.from('profiles').select('username, avatar_url').eq('id', userId).maybeSingle()
  return { username: data?.username ?? '', avatar: data?.avatar_url ?? '' }
})
