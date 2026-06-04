import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Cumulative standings up through a matchday number (?through=N; default latest).
export default defineEventHandler(async (event) => {
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const through = Number(getQuery(event).through) || null
  return cumulativeStandings(db, through)
})
