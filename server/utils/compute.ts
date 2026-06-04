import type { SupabaseClient } from '@supabase/supabase-js'

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

// Compute player_points + scores for every matchday that has a challenge and
// finished matches. Idempotent (upserts).
export async function computeScores(db: SupabaseClient) {
  const { data: mds } = await db
    .from('matchdays')
    .select('id, number, challenge:challenge_id(kind, scoring_rules)')
    .order('number')

  const pointRows: { user_id: string, matchday_id: string, player_id: string, points: number }[] = []
  const scoreRows: { user_id: string, matchday_id: string, points: number }[] = []
  let matchdaysScored = 0

  for (const md of (mds ?? []) as { id: string, challenge: { kind: string, scoring_rules: ScoringRules & { achieved?: number } } | { kind: string, scoring_rules: ScoringRules & { achieved?: number } }[] | null }[]) {
    const challenge = one(md.challenge)
    if (!challenge) continue
    const rules = challenge.scoring_rules ?? {}

    const { data: matches } = await db.from('matches').select('id').eq('matchday_id', md.id)
    const matchIds = (matches ?? []).map(m => m.id)
    if (!matchIds.length) continue

    // Per-player aggregated stats for this matchday
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

    // Manual challenges: which players were awarded
    const awarded = new Set<string>()
    if (challenge.kind === 'manual') {
      const { data: aw } = await db.from('manual_awards').select('player_id').eq('matchday_id', md.id).eq('achieved', true)
      for (const a of (aw ?? []) as { player_id: string }[]) awarded.add(a.player_id)
    }

    const { data: selections } = await db
      .from('selections')
      .select('user_id, selection_players(player_id)')
      .eq('matchday_id', md.id)

    for (const sel of (selections ?? []) as { user_id: string, selection_players: { player_id: string }[] }[]) {
      let total = 0
      for (const sp of sel.selection_players) {
        const pts = challenge.kind === 'manual'
          ? (awarded.has(sp.player_id) ? (rules.achieved ?? 0) : 0)
          : scorePlayer(rules, statByPlayer.get(sp.player_id))
        pointRows.push({ user_id: sel.user_id, matchday_id: md.id, player_id: sp.player_id, points: pts })
        total += pts
      }
      scoreRows.push({ user_id: sel.user_id, matchday_id: md.id, points: total })
    }
    matchdaysScored++
  }

  if (pointRows.length) await db.from('player_points').upsert(pointRows, { onConflict: 'user_id,matchday_id,player_id' })
  if (scoreRows.length) await db.from('scores').upsert(scoreRows, { onConflict: 'user_id,matchday_id' })

  return { matchdaysScored, playerPoints: pointRows.length, scores: scoreRows.length }
}
