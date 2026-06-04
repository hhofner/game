interface AuthUser {
  name: string
}

// Mock auth for the prototype (persisted in a cookie). No real backend.
export function useAuth() {
  const user = useCookie<AuthUser | null>('game_user', { default: () => null })
  const loggedIn = computed(() => !!user.value)

  function login(name: string) {
    user.value = { name }
  }

  function register(name: string) {
    user.value = { name }
  }

  function logout() {
    user.value = null
    navigateTo('/login')
  }

  return { user, loggedIn, login, register, logout }
}
