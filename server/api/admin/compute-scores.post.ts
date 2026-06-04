import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

// Compute player_points + scores for every matchday that has a challenge and
// finished matches. Idempotent (upserts). Testing-mode only.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Disabled in production' })
  }
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  const { data: mds } = await db
    .from('matchdays')
    .select('id, number, challenge:challenge_id(scoring_rules)')
    .order('number')

  const pointRows: { user_id: string, matchday_id: string, player_id: string, points: number }[] = []
  const scoreRows: { user_id: string, matchday_id: string, points: number }[] = []
  let matchdaysScored = 0

  for (const md of (mds ?? []) as { id: string, number: number, challenge: { scoring_rules: ScoringRules } | { scoring_rules: ScoringRules }[] | null }[]) {
    const challenge = one(md.challenge)
    if (!challenge) continue
    const rules = challenge.scoring_rules ?? {}

    // Matches in this matchday
    const { data: matches } = await db.from('matches').select('id').eq('matchday_id', md.id)
    const matchIds = (matches ?? []).map(m => m.id)
    if (!matchIds.length) continue

    // Aggregate stats per player across this matchday's matches
    const { data: stats } = await db
      .from('player_match_stats')
      .select('player_id, minutes, goals, assists, clean_sheet, yellow, red')
      .in('match_id', matchIds)
    const statByPlayer = new Map<string, PlayerStat>()
    for (const s of (stats ?? []) as (PlayerStat & { player_id: string })[]) {
      const cur = statByPlayer.get(s.player_id)
      if (!cur) {
        statByPlayer.set(s.player_id, { minutes: s.minutes, goals: s.goals, assists: s.assists, clean_sheet: s.clean_sheet, yellow: s.yellow, red: s.red })
      } else {
        cur.minutes += s.minutes
        cur.goals += s.goals
        cur.assists += s.assists
        cur.yellow += s.yellow
        cur.red += s.red
        cur.clean_sheet = cur.clean_sheet || s.clean_sheet
      }
    }

    // Selections for this matchday
    const { data: selections } = await db
      .from('selections')
      .select('user_id, selection_players(player_id)')
      .eq('matchday_id', md.id)

    for (const sel of (selections ?? []) as { user_id: string, selection_players: { player_id: string }[] }[]) {
      let total = 0
      for (const sp of sel.selection_players) {
        const pts = scorePlayer(rules, statByPlayer.get(sp.player_id))
        pointRows.push({ user_id: sel.user_id, matchday_id: md.id, player_id: sp.player_id, points: pts })
        total += pts
      }
      scoreRows.push({ user_id: sel.user_id, matchday_id: md.id, points: total })
    }
    matchdaysScored++
  }

  if (pointRows.length) {
    const { error } = await db.from('player_points').upsert(pointRows, { onConflict: 'user_id,matchday_id,player_id' })
    if (error) throw createError({ statusCode: 500, statusMessage: `player_points: ${error.message}` })
  }
  if (scoreRows.length) {
    const { error } = await db.from('scores').upsert(scoreRows, { onConflict: 'user_id,matchday_id' })
    if (error) throw createError({ statusCode: 500, statusMessage: `scores: ${error.message}` })
  }

  return { matchdaysScored, playerPoints: pointRows.length, scores: scoreRows.length }
})
