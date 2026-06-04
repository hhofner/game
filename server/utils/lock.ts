import type { SupabaseClient } from '@supabase/supabase-js'

// Lock a matchday's selections and auto-fill empty slots with random eligible
// players (whose team features in that matchday). Idempotent.
export async function lockMatchdayById(db: SupabaseClient, matchdayId: string) {
  const { data: matches } = await db.from('matches').select('home_team_id, away_team_id').eq('matchday_id', matchdayId)
  const teamIds = [...new Set((matches ?? []).flatMap(m => [m.home_team_id, m.away_team_id]).filter(Boolean))]
  const { data: eligible } = await db.from('players').select('id').in('team_id', teamIds)
  const eligibleIds = (eligible ?? []).map(p => p.id)

  const { data: sels } = await db
    .from('selections')
    .select('id, selection_players(player_id)')
    .eq('matchday_id', matchdayId)

  const inserts: { selection_id: string, player_id: string }[] = []
  const autoFilledSelIds: string[] = []
  for (const sel of (sels ?? []) as { id: string, selection_players: { player_id: string }[] }[]) {
    const existing = new Set(sel.selection_players.map(p => p.player_id))
    const need = 3 - existing.size
    if (need <= 0) continue
    const pool = eligibleIds.filter(id => !existing.has(id))
    for (let i = 0; i < need && pool.length; i++) {
      inserts.push({ selection_id: sel.id, player_id: pool.splice(Math.floor(Math.random() * pool.length), 1)[0]! })
    }
    autoFilledSelIds.push(sel.id)
  }

  if (inserts.length) await db.from('selection_players').insert(inserts)
  if (autoFilledSelIds.length) await db.from('selections').update({ auto_filled: true }).in('id', autoFilledSelIds)
  await db.from('selections').update({ locked_at: new Date().toISOString() }).eq('matchday_id', matchdayId)

  return { locked: sels?.length ?? 0, autoFilled: autoFilledSelIds.length, picksAdded: inserts.length }
}
