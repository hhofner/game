import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Ingest teams + matchdays + matches for the active season.
export default defineEventHandler(async (event) => {
  assertAdmin(event)
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  return ingestStructure(db)
})
