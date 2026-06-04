// App-wide mode flag. Testing exposes sandbox/admin triggers and the beta
// banner; production hides them and runs on real schedule + cron.
export function useAppMode() {
  const appMode = useRuntimeConfig().public.appMode
  const isTesting = computed(() => appMode !== 'production')
  const isProduction = computed(() => appMode === 'production')
  return { appMode, isTesting, isProduction }
}
