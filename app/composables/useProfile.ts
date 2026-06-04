// Current user's avatar, persisted to profiles.avatar_url.
export function useProfile() {
  const avatar = useState('profileAvatar', () => '')
  const loaded = useState('profile-loaded', () => false)

  async function loadAvatar(force = false) {
    if (loaded.value && !force) return
    try {
      const d = await $fetch<{ avatar: string }>('/api/profile')
      avatar.value = d.avatar ?? ''
      loaded.value = true
    } catch {
      // not authenticated yet
    }
  }

  async function setAvatar(url: string) {
    avatar.value = url
    await $fetch('/api/profile', { method: 'PUT', body: { avatar: url } })
  }

  return { avatar, loadAvatar, setAvatar }
}
