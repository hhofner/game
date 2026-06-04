import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Challenge pool (stat-based). `tier` matches matchday.type ('early' | 'late').
const POOL = [
  { key: 'goal-rush', title: 'Goal Rush', tier: 'early', kind: 'stat', criteria: ['Goals are king', 'Every appearance counts'], scoring_rules: { goals: 6, assists: 3, appearance: 1 } },
  { key: 'all-rounder', title: 'All-Rounder', tier: 'early', kind: 'stat', criteria: ['Goals and assists valued equally', 'Clean sheets help'], scoring_rules: { goals: 4, assists: 4, clean_sheet: 3, appearance: 1 } },
  { key: 'clean-machine', title: 'Clean Machine', tier: 'early', kind: 'stat', criteria: ['Clean sheets pay big', 'Avoid red cards'], scoring_rules: { clean_sheet: 6, goals: 3, assists: 2, appearance: 1, red: -4 } },
  { key: 'fair-play', title: 'Fair Play', tier: 'early', kind: 'stat', criteria: ['Stay on the pitch', 'Cards cost you'], scoring_rules: { goals: 4, assists: 3, appearance: 2, yellow: -2, red: -5 } },
  { key: 'clutch', title: 'Clutch Performers', tier: 'late', kind: 'stat', criteria: ['Knockout goals are huge', 'Show up on the big stage'], scoring_rules: { goals: 8, assists: 5, appearance: 2 } },
  { key: 'iron-defense', title: 'Iron Defense', tier: 'late', kind: 'stat', criteria: ['Clean sheets win knockouts'], scoring_rules: { clean_sheet: 8, goals: 4, assists: 3, appearance: 2 } },
  { key: 'big-game', title: 'Big Game', tier: 'late', kind: 'stat', criteria: ['Everything matters now', 'No red cards'], scoring_rules: { goals: 7, assists: 4, clean_sheet: 4, appearance: 2, red: -5 } },
  // Manual (adjudicated) challenges — the fun ones no stats feed reports.
  { key: 'backflip', title: 'Backflip Bonus', tier: 'early', kind: 'manual', criteria: ['Pick a player who does a backflip celebration'], scoring_rules: { achieved: 12 } },
  { key: 'shush', title: 'Shush the Crowd', tier: 'late', kind: 'manual', criteria: ['Pick a player who scores then shushes the crowd'], scoring_rules: { achieved: 15 } }
]

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Seeding disabled in production' })
  }
  const reassign = getQuery(event).reassign === '1'
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  // Upsert the pool
  const { data: challenges, error: cErr } = await db
    .from('challenges')
    .upsert(POOL, { onConflict: 'key' })
    .select('id, tier')
  if (cErr) throw createError({ statusCode: 500, statusMessage: `challenges: ${cErr.message}` })

  const byTier: Record<string, string[]> = { early: [], late: [] }
  for (const c of challenges as { id: string, tier: string }[]) byTier[c.tier]?.push(c.id)

  // Assign a random challenge of the matching tier to each matchday
  const { data: mds } = await db.from('matchdays').select('id, type, challenge_id').order('number')
  let assigned = 0
  for (const md of (mds ?? []) as { id: string, type: string, challenge_id: string | null }[]) {
    if (md.challenge_id && !reassign) continue
    const pool = byTier[md.type] ?? []
    if (!pool.length) continue
    const pick = pool[Math.floor(Math.random() * pool.length)]
    const { error } = await db.from('matchdays').update({ challenge_id: pick }).eq('id', md.id)
    if (!error) assigned++
  }

  return { challenges: POOL.length, assigned }
})
