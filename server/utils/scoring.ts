export interface ScoringRules {
  appearance?: number
  goals?: number
  assists?: number
  clean_sheet?: number
  yellow?: number
  red?: number
}

export interface PlayerStat {
  minutes: number
  goals: number
  assists: number
  clean_sheet: boolean
  yellow: number
  red: number
}

// Points a player earns under a challenge's rules. Players who did not play
// (minutes <= 0) score nothing, regardless of the rules.
export function scorePlayer(rules: ScoringRules, s: PlayerStat | undefined): number {
  if (!s || s.minutes <= 0) return 0
  return (rules.appearance ?? 0)
    + (s.goals ?? 0) * (rules.goals ?? 0)
    + (s.assists ?? 0) * (rules.assists ?? 0)
    + (s.clean_sheet ? (rules.clean_sheet ?? 0) : 0)
    + (s.yellow ?? 0) * (rules.yellow ?? 0)
    + (s.red ?? 0) * (rules.red ?? 0)
}
