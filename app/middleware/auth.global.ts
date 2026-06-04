export default defineNuxtRouteMiddleware((to) => {
  // Enforce on the client only so prerendering stays intact
  if (import.meta.server) return

  const { loggedIn } = useAuth()
  const isAuthPage = to.path === '/login' || to.path === '/register'

  if (!loggedIn.value && !isAuthPage) return navigateTo('/login')
  if (loggedIn.value && isAuthPage) return navigateTo('/')
})
