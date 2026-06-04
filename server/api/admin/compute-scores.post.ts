import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Recompute scores for all matchdays. Testing-mode only.
export default defineEventHandler(async (event) => {
  assertAdmin(event)
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  return computeScores(db)
})
