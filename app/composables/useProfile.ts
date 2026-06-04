// Current user's profile state, shared across pages
export function useProfile() {
  const username = useState('profileUsername', () => 'Player One')
  // Chosen profile picture (may be an animated GIF). Empty = icon fallback.
  const avatar = useState('profileAvatar', () => '')

  return { username, avatar }
}
