// Auth wrapper around Supabase. Email + password, with an invite gate on register.
export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const loggedIn = computed(() => !!user.value)
  const username = computed(() =>
    (user.value?.user_metadata?.username as string | undefined)
    || user.value?.email?.split('@')[0]
    || 'Player'
  )

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await navigateTo('/')
  }

  async function register(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: name } }
    })
    if (error) throw error
    await navigateTo('/')
  }

  async function logout() {
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  return { user, loggedIn, username, login, register, logout }
}
