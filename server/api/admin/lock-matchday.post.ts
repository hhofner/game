import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

// Lock a matchday's selections and auto-fill empty slots with random eligible
// players (players whose team features in that matchday). Mirrors what runs at
// real kickoff. Testing-mode only. POST /api/admin/lock-matchday?matchday=N
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Disabled in production' })
  }
  const n = Number(getQuery(event).matchday)
  if (!n) throw createError({ statusCode: 400, statusMessage: 'matchday number required' })

  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  const { data: md } = await db.from('matchdays').select('id').eq('number', n).maybeSingle()
  if (!md) throw createError({ statusCode: 404, statusMessage: `No matchday ${n}` })

  // Teams playing this matchday -> eligible players
  const { data: matches } = await db.from('matches').select('home_team_id, away_team_id').eq('matchday_id', md.id)
  const teamIds = [...new Set((matches ?? []).flatMap(m => [m.home_team_id, m.away_team_id]).filter(Boolean))]
  const { data: eligible } = await db.from('players').select('id').in('team_id', teamIds)
  const eligibleIds = (eligible ?? []).map(p => p.id)

  const { data: sels } = await db
    .from('selections')
    .select('id, selection_players(player_id)')
    .eq('matchday_id', md.id)

  const inserts: { selection_id: string, player_id: string }[] = []
  const autoFilledSelIds: string[] = []
  for (const sel of (sels ?? []) as { id: string, selection_players: { player_id: string }[] }[]) {
    const existing = new Set(sel.selection_players.map(p => p.player_id))
    const need = 3 - existing.size
    if (need <= 0) continue
    const pool = eligibleIds.filter(id => !existing.has(id))
    for (let i = 0; i < need && pool.length; i++) {
      const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]!
      inserts.push({ selection_id: sel.id, player_id: pick })
    }
    autoFilledSelIds.push(sel.id)
  }

  if (inserts.length) {
    const { error } = await db.from('selection_players').insert(inserts)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (autoFilledSelIds.length) {
    await db.from('selections').update({ auto_filled: true }).in('id', autoFilledSelIds)
  }
  // Lock everything for this matchday
  await db.from('selections').update({ locked_at: new Date().toISOString() }).eq('matchday_id', md.id)

  return { matchday: n, locked: sels?.length ?? 0, autoFilled: autoFilledSelIds.length, picksAdded: inserts.length }
})
