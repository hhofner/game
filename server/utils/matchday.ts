import type { SupabaseClient } from '@supabase/supabase-js'

export interface CurrentMatchday {
  id: string
  number: number
  label: string
  type: string
  starts_at: string | null
}

// The matchday users are currently picking for: the earliest one that hasn't
// kicked off yet. With historical/testing data (everything in the past) this
// falls back to the earliest matchday so the flow stays exercisable.
// TODO: replace `now` with the simulated clock in testing mode.
export async function currentMatchday(db: SupabaseClient): Promise<CurrentMatchday | null> {
  const { data } = await db
    .from('matchdays')
    .select('id, number, label, type, starts_at')
    .order('number')
  const rows = (data ?? []) as CurrentMatchday[]
  const now = await getNow(db)
  return rows.find(m => m.starts_at && m.starts_at > now) ?? rows[0] ?? null
}
