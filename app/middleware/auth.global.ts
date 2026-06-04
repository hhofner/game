export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const isAuthPage = to.path === '/login' || to.path === '/register'

  if (!user.value && !isAuthPage) return navigateTo('/login')
  if (user.value && isAuthPage) return navigateTo('/')
})
