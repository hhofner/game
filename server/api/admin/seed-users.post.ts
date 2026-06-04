import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'

const BOTS = [
  { email: 'bot1@wc.test', username: 'Group Stage Gary' },
  { email: 'bot2@wc.test', username: 'Knockout Nadia' },
  { email: 'bot3@wc.test', username: 'Penalty Pete' },
  { email: 'bot4@wc.test', username: 'Offside Olu' },
  { email: 'bot5@wc.test', username: 'VAR Vera' },
  { email: 'bot6@wc.test', username: 'Hat-trick Hugo' }
]

function pick3(ids: string[]) {
  const pool = [...ids]
  const out: string[] = []
  for (let i = 0; i < 3 && pool.length; i++) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]!)
  }
  return out
}

// Seed bot accounts with random selections for every matchday, so scoring +
// leaderboard are demonstrable. Testing-mode only. Idempotent.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Seeding disabled in production' })
  }
  const db = serverSupabaseServiceRole(event) as unknown as SupabaseClient

  // Existing users by email
  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 })
  const idByEmail = new Map<string, string>((list?.users ?? []).map(u => [u.email ?? '', u.id]))

  for (const bot of BOTS) {
    if (idByEmail.has(bot.email)) continue
    const { data, error } = await db.auth.admin.createUser({
      email: bot.email,
      password: 'BotPass123!',
      email_confirm: true,
      user_metadata: { username: bot.username }
    })
    if (!error && data.user) idByEmail.set(bot.email, data.user.id)
  }
  const botIds = BOTS.map(b => idByEmail.get(b.email)).filter(Boolean) as string[]

  const { data: mdRows } = await db.from('matchdays').select('id')
  const matchdayIds = (mdRows ?? []).map(m => m.id)
  const { data: playerRows } = await db.from('players').select('id')
  const playerIds = (playerRows ?? []).map(p => p.id)

  // Upsert one selection per (bot, matchday)
  const selInput = botIds.flatMap(uid => matchdayIds.map(mid => ({ user_id: uid, matchday_id: mid, auto_filled: true })))
  const { data: selRows, error: selErr } = await db
    .from('selections')
    .upsert(selInput, { onConflict: 'user_id,matchday_id' })
    .select('id')
  if (selErr) throw createError({ statusCode: 500, statusMessage: `selections: ${selErr.message}` })
  const selIds = (selRows ?? []).map(r => r.id)

  // Reset and refill their picks
  await db.from('selection_players').delete().in('selection_id', selIds)
  const spInput = selIds.flatMap(sid => pick3(playerIds).map(pid => ({ selection_id: sid, player_id: pid })))
  const { error: spErr } = await db.from('selection_players').insert(spInput)
  if (spErr) throw createError({ statusCode: 500, statusMessage: `selection_players: ${spErr.message}` })

  return { bots: botIds.length, selections: selIds.length, picks: spInput.length }
})
