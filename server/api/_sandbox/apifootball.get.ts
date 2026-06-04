// Sandbox passthrough to inspect API-Football responses. Testing/dev only.
//
// Examples:
//   /api/_sandbox/apifootball?path=/status
//   /api/_sandbox/apifootball?path=/fixtures&league=1&season=2022
//   /api/_sandbox/apifootball?path=/fixtures/players&fixture=855736
export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.appMode === 'production' && !import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const { path, ...params } = getQuery(event)
  const af = apiFootball()
  return af.get((path as string) || '/status', params as Record<string, string>)
})
