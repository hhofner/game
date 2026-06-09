export interface ThresholdRule {
  threshold: number
  points: number
}

export interface ScoringRules {
  // threshold rules for any PlayerStat key
  goals?: ThresholdRule
  assists?: ThresholdRule
  clean_sheet?: ThresholdRule
  yellow?: ThresholdRule
  red?: ThresholdRule
  shots?: ThresholdRule
  shots_on_target?: ThresholdRule
  key_passes?: ThresholdRule
  passes?: ThresholdRule
  pass_accuracy?: ThresholdRule
  tackles?: ThresholdRule
  interceptions?: ThresholdRule
  blocks?: ThresholdRule
  duels_won?: ThresholdRule
  dribbles_completed?: ThresholdRule
  fouls_drawn?: ThresholdRule
  fouls_committed?: ThresholdRule
  saves?: ThresholdRule
  offsides?: ThresholdRule
  penalties_scored?: ThresholdRule
  penalties_missed?: ThresholdRule
  penalties_saved?: ThresholdRule
  rating?: ThresholdRule
  achieved?: number
}

export interface PlayerStat {
  minutes: number
  goals: number
  assists: number
  clean_sheet: boolean
  yellow: number
  red: number
  shots: number
  shots_on_target: number
  key_passes: number
  passes: number
  pass_accuracy: number
  tackles: number
  interceptions: number
  blocks: number
  duels_won: number
  dribbles_completed: number
  fouls_drawn: number
  fouls_committed: number
  saves: number
  offsides: number
  penalties_scored: number
  penalties_missed: number
  penalties_saved: number
  rating: number
}

export interface AggregateResult {
  stat: string
  total: number
  threshold: number
  points: number
  passed: boolean
}

const NUM_STATS: (keyof PlayerStat)[] = [
  'goals', 'assists', 'yellow', 'red',
  'shots', 'shots_on_target', 'key_passes', 'passes', 'pass_accuracy',
  'tackles', 'interceptions', 'blocks', 'duels_won', 'dribbles_completed',
  'fouls_drawn', 'fouls_committed', 'saves', 'offsides',
  'penalties_scored', 'penalties_missed', 'penalties_saved', 'rating'
]

export function aggregateStats(stats: (PlayerStat | undefined)[]): Record<string, number> {
  const playing = stats.filter((s): s is PlayerStat => !!s && s.minutes > 0)
  const agg: Record<string, number> = {
    clean_sheet: playing.reduce((s, p) => s + (p.clean_sheet ? 1 : 0), 0)
  }
  for (const key of NUM_STATS) {
    agg[key] = playing.reduce((s, p) => s + (Number(p[key]) || 0), 0)
  }
  return agg
}

// Total points awarded when the selected players' combined stats meet the rules' thresholds.
export function scoreSelection(rules: ScoringRules, stats: (PlayerStat | undefined)[]): number {
  const agg = aggregateStats(stats)
  let total = 0
  for (const [stat, rule] of Object.entries(rules)) {
    if (!rule || typeof rule !== 'object' || !('threshold' in rule)) continue
    const r = rule as ThresholdRule
    if ((agg[stat] ?? 0) >= r.threshold) total += r.points
  }
  return total
}

export function aggregateResults(rules: ScoringRules, stats: (PlayerStat | undefined)[]): AggregateResult[] {
  const agg = aggregateStats(stats)
  return Object.entries(rules)
    .filter(([, rule]) => rule && typeof rule === 'object' && 'threshold' in rule)
    .map(([stat, rule]) => {
      const r = rule as ThresholdRule
      const total = agg[stat] ?? 0
      return { stat, total, threshold: r.threshold, points: r.points, passed: total >= r.threshold }
    })
}
