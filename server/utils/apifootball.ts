// API-Football (api-sports.io / api-football.com) client. Server-only.
// Free plan covers seasons 2022-2024, so testing runs on the real, completed
// World Cup 2022; production uses 2026 (requires a paid plan).
const BASE = 'https://v3.football.api-sports.io'

export const WC_LEAGUE_ID = 1

export function wcSeason() {
  return useRuntimeConfig().public.appMode === 'production' ? 2026 : 2022
}

// Classify an API-Football `league.round` into a matchday phase.
//   early: group stage / round of 32 / round of 16  -> matchday per date
//   late:  quarter-finals / semi-finals / final      -> matchday per round
// Checked specific-first so "Final" doesn't swallow "Quarter-finals".
const LATE_ROUNDS: { re: RegExp, label: string }[] = [
  { re: /quarter/i, label: 'Quarter-finals' },
  { re: /semi/i, label: 'Semi-finals' },
  { re: /3rd place|third place/i, label: 'Third-place play-off' },
  { re: /final/i, label: 'Final' }
]

export function classifyRound(round: string): { phase: 'early' | 'late', roundLabel: string } {
  for (const r of LATE_ROUNDS) {
    if (r.re.test(round)) return { phase: 'late', roundLabel: r.label }
  }
  // Normalise API label: "Group Stage - 1" → "Group Stage 1"
  return { phase: 'early', roundLabel: round.replace(/\s*-\s*(\d)/, ' $1') }
}

export function apiFootball() {
  const { apiFootballKey } = useRuntimeConfig()

  function get<T = unknown>(path: string, params: Record<string, string | number> = {}) {
    return $fetch<{ response: T, results: number, errors: unknown }>(
      `${BASE}${path.startsWith('/') ? path : `/${path}`}`,
      { headers: { 'x-apisports-key': apiFootballKey }, query: params }
    )
  }

  return { get }
}
