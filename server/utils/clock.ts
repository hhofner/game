import type { SupabaseClient } from '@supabase/supabase-js'

// Testing uses a simulated clock (app_config.sim_now) so we can advance through
// the historical season; production always uses the real time.
export async function getNow(db: SupabaseClient): Promise<string> {
  if (useRuntimeConfig().public.appMode === 'production') {
    return new Date().toISOString()
  }
  const { data } = await db.from('app_config').select('value').eq('key', 'sim_now').maybeSingle()
  return (data?.value as string) ?? new Date().toISOString()
}

export async function setNow(db: SupabaseClient, iso: string) {
  await db.from('app_config').upsert({ key: 'sim_now', value: iso }, { onConflict: 'key' })
}
