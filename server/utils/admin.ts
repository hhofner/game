import type { H3Event } from 'h3'

// Admin/ingestion routes: open in testing; in production require a matching
// admin key (header `x-admin-key` or `?key=`), so cron/scripts can still run.
export function assertAdmin(event: H3Event) {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode !== 'production') return
  const key = getHeader(event, 'x-admin-key') || (getQuery(event).key as string | undefined)
  if (!cfg.adminKey || key !== cfg.adminKey) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
}

// Strictly testing-only routes (sandbox, sim clock, bot seeding).
export function assertTesting(event: H3Event) {
  if (useRuntimeConfig(event).public.appMode === 'production') {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
}
