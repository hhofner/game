import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Ingest per-player match stats for finished fixtures (paced). ?limit=N&force=1 to re-ingest already-done matches.
export default defineEventHandler(async (event) => {
  assertAdmin(event)
  const limit = Math.max(1, Math.min(80, Number(getQuery(event).limit) || 12))
  const force = getQuery(event).force === '1'
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  return ingestStats(db, limit, force)
})
