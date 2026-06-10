import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Challenge pool (stat-based). `tier` matches matchday.type ('early' | 'late').
// Each stat rule: if the 3 selected players' combined total >= threshold, award those points.
// The challenge marked `default: true` is assigned to all fresh matchdays; others rotate in on reassign.
const POOL = [
  // ── DEFAULT ─────────────────────────────────────────────────────────────
  {
    key: 'key-passes',
    title: 'Key Passers',
    tier: 'early',
    kind: 'stat',
    default: true,
    criteria: ['1+ combined key passes = 30pts', '2+ combined assists = 15pts', '1+ goal = 10pts'],
    scoring_rules: {
      key_passes: { threshold: 1, points: 30 },
      assists: { threshold: 2, points: 15 },
      goals: { threshold: 1, points: 10 }
    }
  },
  // ── EARLY TIER ──────────────────────────────────────────────────────────
  {
    key: 'goal-rush',
    title: 'Goal Rush',
    tier: 'early',
    kind: 'stat',
    criteria: ['2+ combined goals = 20pts', '2+ combined assists = 12pts', '1+ clean sheet = 8pts'],
    scoring_rules: {
      goals: { threshold: 2, points: 20 },
      assists: { threshold: 2, points: 12 },
      clean_sheet: { threshold: 1, points: 8 }
    }
  },
  {
    key: 'clean-machine',
    title: 'Clean Machine',
    tier: 'early',
    kind: 'stat',
    criteria: ['2+ clean sheets = 25pts', '1+ goal = 10pts', '1+ assist = 5pts'],
    scoring_rules: {
      clean_sheet: { threshold: 2, points: 25 },
      goals: { threshold: 1, points: 10 },
      assists: { threshold: 1, points: 5 }
    }
  },
  {
    key: 'clinical',
    title: 'Clinical Finishers',
    tier: 'early',
    kind: 'stat',
    criteria: ['3+ shots on target = 20pts', '1+ goal = 15pts', '1+ assist = 10pts'],
    scoring_rules: {
      shots_on_target: { threshold: 3, points: 20 },
      goals: { threshold: 1, points: 15 },
      assists: { threshold: 1, points: 10 }
    }
  },
  {
    key: 'shutdown',
    title: 'Shutdown Squad',
    tier: 'early',
    kind: 'stat',
    criteria: ['6+ tackles & interceptions = 25pts', '1+ clean sheet = 15pts'],
    scoring_rules: {
      tackles: { threshold: 4, points: 15 },
      interceptions: { threshold: 2, points: 10 },
      clean_sheet: { threshold: 1, points: 15 }
    }
  },
  // ── LATE TIER ───────────────────────────────────────────────────────────
  {
    key: 'clutch',
    title: 'Clutch Performers',
    tier: 'late',
    kind: 'stat',
    criteria: ['2+ goals = 25pts', '2+ assists = 15pts', '3+ shots on target = 10pts'],
    scoring_rules: {
      goals: { threshold: 2, points: 25 },
      assists: { threshold: 2, points: 15 },
      shots_on_target: { threshold: 3, points: 10 }
    }
  },
  {
    key: 'iron-defense',
    title: 'Iron Defense',
    tier: 'late',
    kind: 'stat',
    criteria: ['2+ clean sheets = 30pts', '5+ saves = 15pts', '1+ goal = 10pts'],
    scoring_rules: {
      clean_sheet: { threshold: 2, points: 30 },
      saves: { threshold: 5, points: 15 },
      goals: { threshold: 1, points: 10 }
    }
  },
  {
    key: 'big-game',
    title: 'Big Game',
    tier: 'late',
    kind: 'stat',
    criteria: ['3+ goals = 30pts', '4+ key passes = 20pts', '1+ clean sheet = 15pts'],
    scoring_rules: {
      goals: { threshold: 3, points: 30 },
      key_passes: { threshold: 4, points: 20 },
      clean_sheet: { threshold: 1, points: 15 }
    }
  },
  // ── MANUAL ──────────────────────────────────────────────────────────────
  { key: 'backflip', title: 'Backflip Bonus', tier: 'early', kind: 'manual', criteria: ['Pick a player who does a backflip celebration'], scoring_rules: { achieved: 12 } },
  { key: 'shush', title: 'Shush the Crowd', tier: 'late', kind: 'manual', criteria: ['Pick a player who scores then shushes the crowd'], scoring_rules: { achieved: 15 } }
]

export default defineEventHandler(async (event) => {
  assertAdmin(event)
  const reassign = getQuery(event).reassign === '1'
  const useDefault = getQuery(event).default === '1'
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  // Upsert the pool (strip the `default` flag — it's local metadata, not a DB column)
  const dbRows = POOL.map(({ default: _, ...rest }) => rest)
  const { data: challenges, error: cErr } = await db
    .from('challenges')
    .upsert(dbRows, { onConflict: 'key' })
    .select('id, tier, key')
  if (cErr) throw createError({ statusCode: 500, statusMessage: `challenges: ${cErr.message}` })

  const byTier: Record<string, string[]> = { early: [], late: [] }
  const defaultIdByTier: Record<string, string> = {}
  for (const c of challenges as { id: string, tier: string, key: string }[]) {
    byTier[c.tier]?.push(c.id)
    const poolEntry = (POOL as { key: string, default?: boolean }[]).find(p => p.key === c.key)
    if (poolEntry?.default) defaultIdByTier[c.tier] = c.id
  }

  // ?default=1 → force default on all; ?reassign=1 → shuffle randomly; otherwise only touch unassigned
  const { data: mds } = await db.from('matchdays').select('id, type, challenge_id').order('number')
  let assigned = 0
  for (const md of (mds ?? []) as { id: string, type: string, challenge_id: string | null }[]) {
    if (md.challenge_id && !reassign && !useDefault) continue
    const pool = byTier[md.type] ?? []
    if (!pool.length) continue
    const pick = useDefault
      ? (defaultIdByTier[md.type] ?? pool[Math.floor(Math.random() * pool.length)])
      : reassign
        ? pool[Math.floor(Math.random() * pool.length)]
        : (defaultIdByTier[md.type] ?? pool[Math.floor(Math.random() * pool.length)])
    const { error } = await db.from('matchdays').update({ challenge_id: pick }).eq('id', md.id)
    if (!error) assigned++
  }

  return { challenges: POOL.length, assigned }
})
