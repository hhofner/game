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

  for (const md of (mds ?? []) as { id: string, challenge: { kind: string, scoring_rules: ScoringRules } | { kind: string, scoring_rules: ScoringRules }[] | null }[]) {
    const challenge = one(md.challenge)
    if (!challenge) continue
    const rules = challenge.scoring_rules ?? {}

    const { data: matches } = await db.from('matches').select('id').eq('matchday_id', md.id)
    const matchIds = (matches ?? []).map(m => m.id)
    if (!matchIds.length) continue

    // Per-player aggregated stats for this matchday (fall back to base columns if migration not yet applied)
    let { data: stats, error: statsErr } = await db
      .from('player_match_stats')
      .select('player_id, minutes, goals, assists, clean_sheet, yellow, red, shots, shots_on_target, key_passes, passes, pass_accuracy, tackles, interceptions, blocks, duels_won, dribbles_completed, fouls_drawn, fouls_committed, saves, offsides, penalties_scored, penalties_missed, penalties_saved, rating')
      .in('match_id', matchIds)
    if (statsErr) {
      const fallback = await db
        .from('player_match_stats')
        .select('player_id, minutes, goals, assists, clean_sheet, yellow, red')
        .in('match_id', matchIds)
      stats = fallback.data
    }
    const NUM_KEYS: (keyof PlayerStat)[] = [
      'goals', 'assists', 'yellow', 'red',
      'shots', 'shots_on_target', 'key_passes', 'passes', 'pass_accuracy',
      'tackles', 'interceptions', 'blocks', 'duels_won', 'dribbles_completed',
      'fouls_drawn', 'fouls_committed', 'saves', 'offsides',
      'penalties_scored', 'penalties_missed', 'penalties_saved', 'rating'
    ]
    const statByPlayer = new Map<string, PlayerStat>()
    for (const s of (stats ?? []) as (PlayerStat & { player_id: string })[]) {
      const cur = statByPlayer.get(s.player_id)
      if (!cur) {
        const entry: PlayerStat = { minutes: s.minutes, clean_sheet: s.clean_sheet } as PlayerStat
        for (const k of NUM_KEYS) (entry as Record<string, number>)[k as string] = Number(s[k]) || 0
        statByPlayer.set(s.player_id, entry)
      } else {
        cur.minutes += s.minutes
        cur.clean_sheet = cur.clean_sheet || s.clean_sheet
        for (const k of NUM_KEYS) (cur as Record<string, number>)[k as string] += Number(s[k]) || 0
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
      if (challenge.kind === 'manual') {
        let total = 0
        for (const sp of sel.selection_players) {
          const pts = awarded.has(sp.player_id) ? (rules.achieved ?? 0) : 0
          pointRows.push({ user_id: sel.user_id, matchday_id: md.id, player_id: sp.player_id, points: pts })
          total += pts
        }
        scoreRows.push({ user_id: sel.user_id, matchday_id: md.id, points: total })
      } else {
        const playerStats = sel.selection_players.map(sp => statByPlayer.get(sp.player_id))
        const total = scoreSelection(rules, playerStats)
        for (const sp of sel.selection_players) {
          pointRows.push({ user_id: sel.user_id, matchday_id: md.id, player_id: sp.player_id, points: 0 })
        }
        scoreRows.push({ user_id: sel.user_id, matchday_id: md.id, points: total })
      }
    }
    matchdaysScored++
  }

  if (pointRows.length) await db.from('player_points').upsert(pointRows, { onConflict: 'user_id,matchday_id,player_id' })
  if (scoreRows.length) await db.from('scores').upsert(scoreRows, { onConflict: 'user_id,matchday_id' })

  return { matchdaysScored, playerPoints: pointRows.length, scores: scoreRows.length }
}
