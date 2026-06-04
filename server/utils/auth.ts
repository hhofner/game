import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

// Resolve the authenticated user's id from the access-token `sub` claim.
// serverSupabaseUser().id can be null with the new asymmetric JWT signing keys,
// so we read the id straight from the token. Returns null if not authenticated.
export async function getUserId(event: H3Event): Promise<string | null> {
  const client = await serverSupabaseClient(event)
  const { data } = await client.auth.getSession()
  const token = data.session?.access_token
  if (!token) return null
  try {
    const part = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
    if (!part) return null
    return JSON.parse(atob(part)).sub ?? null
  } catch {
    return null
  }
}
