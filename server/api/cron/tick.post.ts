import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Production cron tick — call on a schedule (host cron) with the admin key.
// Refreshes fixtures, ingests a batch of finished stats, locks matchdays that
// have kicked off, and recomputes scores. ?limit=N stats per tick.
export default defineEventHandler(async (event) => {
  assertAdmin(event)
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const limit = Math.max(1, Math.min(40, Number(getQuery(event).limit) || 8))

  const structure = await ingestStructure(db)
  const stats = await ingestStats(db, limit)

  // Lock matchdays that have kicked off (real time in production)
  const now = await getNow(db)
  const { data: mds } = await db.from('matchdays').select('id, starts_at')
  let lockedMatchdays = 0
  for (const md of (mds ?? []) as { id: string, starts_at: string | null }[]) {
    if (md.starts_at && md.starts_at <= now) {
      await lockMatchdayById(db, md.id)
      lockedMatchdays++
    }
  }

  const scored = await computeScores(db)
  return { structure, stats, lockedMatchdays, scored }
})
