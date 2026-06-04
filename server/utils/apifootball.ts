// API-Football (api-sports.io / api-football.com) client. Server-only.
// Free plan covers seasons 2022-2024, so testing runs on the real, completed
// World Cup 2022; production uses 2026 (requires a paid plan).
const BASE = 'https://v3.football.api-sports.io'

export const WC_LEAGUE_ID = 1

export function wcSeason() {
  return useRuntimeConfig().public.appMode === 'production' ? 2026 : 2022
}

// Map an API-Football `league.round` string to a matchday slot.
// Ordered: more specific rounds first so "Final" doesn't swallow "Quarter-finals".
const ROUND_MAP: { re: RegExp, number: number, label: string, type: 'group' | 'knockout' }[] = [
  { re: /group stage - 1/i, number: 1, label: 'Matchday 1', type: 'group' },
  { re: /group stage - 2/i, number: 2, label: 'Matchday 2', type: 'group' },
  { re: /group stage - 3/i, number: 3, label: 'Matchday 3', type: 'group' },
  { re: /round of 32/i, number: 4, label: 'Round of 32', type: 'knockout' },
  { re: /round of 16/i, number: 5, label: 'Round of 16', type: 'knockout' },
  { re: /quarter/i, number: 6, label: 'Quarter-finals', type: 'knockout' },
  { re: /semi/i, number: 7, label: 'Semi-finals', type: 'knockout' },
  { re: /3rd place|third place/i, number: 8, label: 'Third-place play-off', type: 'knockout' },
  { re: /final/i, number: 9, label: 'Final', type: 'knockout' }
]

export function mapRound(round: string) {
  return ROUND_MAP.find(r => r.re.test(round)) ?? null
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
