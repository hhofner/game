import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Current simulated clock + which matchday is being picked for. Testing only.
export default defineEventHandler(async (event) => {
  if (useRuntimeConfig(event).public.appMode === 'production') {
    throw createError({ statusCode: 404 })
  }
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const now = await getNow(db)
  const current = await currentMatchday(db)
  return { now, current: current ? { number: current.number, label: current.label } : null }
})
