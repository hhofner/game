import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Lock a matchday + auto-fill empty slots. Testing-mode only.
// POST /api/admin/lock-matchday?matchday=N
export default defineEventHandler(async (event) => {
  if (useRuntimeConfig(event).public.appMode === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Disabled in production' })
  }
  const n = Number(getQuery(event).matchday)
  if (!n) throw createError({ statusCode: 400, statusMessage: 'matchday number required' })

  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const { data: md } = await db.from('matchdays').select('id').eq('number', n).maybeSingle()
  if (!md) throw createError({ statusCode: 404, statusMessage: `No matchday ${n}` })

  return { matchday: n, ...(await lockMatchdayById(db, md.id)) }
})
