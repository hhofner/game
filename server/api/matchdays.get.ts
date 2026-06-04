import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

interface TeamRef { name: string, logo_url: string | null }
interface MatchRow {
  status: string
  home_score: number | null
  away_score: number | null
  kickoff_at: string | null
  home: TeamRef | TeamRef[] | null
  away: TeamRef | TeamRef[] | null
}
interface MatchdayRow {
  number: number
  label: string
  type: string
  status: string
  starts_at: string | null
  matches: MatchRow[]
}

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

// Real matchdays + their fixtures for the active season.
export default defineEventHandler(async (event) => {
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  const { data, error } = await db
    .from('matchdays')
    .select('number, label, type, status, starts_at, matches(status, home_score, away_score, kickoff_at, home:home_team_id(name, logo_url), away:away_team_id(name, logo_url))')
    .order('number')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return (data as MatchdayRow[]).map(md => ({
    number: md.number,
    label: md.label,
    type: md.type,
    status: md.status,
    startsAt: md.starts_at,
    games: [...md.matches]
      .sort((a, b) => (a.kickoff_at ?? '').localeCompare(b.kickoff_at ?? ''))
      .map((m) => {
        const home = one(m.home)
        const away = one(m.away)
        return {
          home: { name: home?.name ?? 'TBD', logo: home?.logo_url ?? null },
          away: { name: away?.name ?? 'TBD', logo: away?.logo_url ?? null },
          status: m.status,
          homeScore: m.home_score,
          awayScore: m.away_score,
          kickoff: m.kickoff_at
        }
      })
  }))
})
