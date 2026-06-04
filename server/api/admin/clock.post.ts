import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

interface MdRow { id: string, number: number, label: string, starts_at: string | null, ends_at: string | null }

// Drive the simulated clock. Testing only.
//   { action: 'reset' }    -> set clock to just before the first matchday
//   { action: 'advance' }  -> play the current matchday: lock + auto-fill + score, advance time
//   { action: 'set', iso } -> set the clock explicitly
export default defineEventHandler(async (event) => {
  assertTesting(event)
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient
  const body = await readBody<{ action?: string, iso?: string }>(event)

  const { data } = await db.from('matchdays').select('id, number, label, starts_at, ends_at').order('number')
  const mds = (data ?? []) as MdRow[]

  if (body?.action === 'reset') {
    const first = mds.find(m => m.starts_at)
    if (!first?.starts_at) throw createError({ statusCode: 400, statusMessage: 'No matchdays' })
    const now = new Date(Date.parse(first.starts_at) - 86_400_000).toISOString()
    await setNow(db, now)
    return { now, current: { number: first.number, label: first.label } }
  }

  if (body?.action === 'set' && body.iso) {
    await setNow(db, body.iso)
    return { now: body.iso }
  }

  // advance: play the current (upcoming) matchday
  const now = await getNow(db)
  const cur = mds.find(m => m.starts_at && m.starts_at > now)
  if (!cur) return { done: true, now, current: null }

  const newNow = new Date(Date.parse(cur.ends_at ?? cur.starts_at!) + 3 * 3_600_000).toISOString()
  await setNow(db, newNow)

  // Lock every matchday that has now kicked off (idempotent), then score.
  for (const md of mds) {
    if (md.starts_at && md.starts_at <= newNow) await lockMatchdayById(db, md.id)
  }
  await computeScores(db)

  const next = mds.find(m => m.starts_at && m.starts_at > newNow)
  return {
    played: { number: cur.number, label: cur.label },
    now: newNow,
    current: next ? { number: next.number, label: next.label } : null
  }
})
