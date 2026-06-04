import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Real player pool with team + tournament totals, sorted by goals.
export default defineEventHandler(async (event) => {
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const players = await getPlayers(db)
  return players.sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
})
