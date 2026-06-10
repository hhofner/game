import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Scheduled scoring tick. Vercel Cron calls this with GET +
// `Authorization: Bearer $CRON_SECRET`. In production it requires that (or our
// admin key); in testing it's open. Refresh fixtures -> ingest finished stats
// -> lock kicked-off matchdays -> recompute scores. ?limit=N stats per tick.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production') {
    const auth = getHeader(event, 'authorization') || ''
    const cronSecret = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.CRON_SECRET
    const adminKey = getHeader(event, 'x-admin-key') || (getQuery(event).key as string | undefined)
    const ok = (cronSecret && auth === `Bearer ${cronSecret}`) || (cfg.adminKey && adminKey === cfg.adminKey)
    if (!ok) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const limit = Math.max(1, Math.min(40, Number(getQuery(event).limit) || 8))

  const structure = await ingestStructure(db)
  const stats = await ingestStats(db, limit)

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
