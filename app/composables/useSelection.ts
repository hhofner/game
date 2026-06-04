export interface Player {
  id: string
  name: string
  photo: string | null
  position: string | null
  nation: string | null
  teamLogo: string | null
  goals?: number
  assists?: number
  apps?: number
}

export interface SelectionMatchday {
  id: string
  number: number
  label: string
  type: string
  starts_at: string | null
}

interface SelectionData {
  matchday: SelectionMatchday | null
  players: Player[]
  autoFilled: boolean
}

export const MAX_SELECTION = 3

// The user's selection for the current matchday, persisted to Supabase.
// Shared across components via a fixed useAsyncData key.
export function useSelection() {
  const { data, pending, refresh } = useAsyncData<SelectionData>(
    'current-selection',
    () => $fetch('/api/selection'),
    { default: () => ({ matchday: null, players: [], autoFilled: false }), server: false }
  )

  const players = computed<Player[]>(() => (data.value?.players ?? []) as Player[])
  const matchday = computed(() => data.value?.matchday ?? null)
  const selected = players
  const count = computed(() => players.value.length)
  const isFull = computed(() => count.value >= MAX_SELECTION)
  const isSelected = (id: string) => players.value.some(p => p.id === id)

  // 3 fixed slots for the home grid
  const selection = computed<(Player | null)[]>(() => {
    const s: (Player | null)[] = [...players.value]
    while (s.length < MAX_SELECTION) s.push(null)
    return s.slice(0, MAX_SELECTION)
  })

  function setPlayers(next: Player[]) {
    if (data.value) data.value.players = next
  }

  async function persist() {
    await $fetch('/api/selection', { method: 'PUT', body: { playerIds: players.value.map(p => p.id) } })
  }

  async function select(player: Player) {
    if (isSelected(player.id) || players.value.length >= MAX_SELECTION) return
    setPlayers([...players.value, player])
    await persist()
  }

  async function removeById(id: string) {
    setPlayers(players.value.filter(p => p.id !== id))
    await persist()
  }

  function removeAt(i: number) {
    const p = selection.value[i]
    if (p) return removeById(p.id)
  }

  async function replaceById(id: string) {
    await removeById(id)
    navigateTo('/players')
  }

  async function autoFill() {
    const pool = await $fetch<Player[]>('/api/players')
    const taken = new Set(players.value.map(p => p.id))
    const available = pool.filter(p => !taken.has(p.id))
    const next = [...players.value]
    while (next.length < MAX_SELECTION && available.length) {
      next.push(available.splice(Math.floor(Math.random() * available.length), 1)[0]!)
    }
    setPlayers(next)
    await persist()
  }

  return {
    selection, selected, matchday, count, isFull, isSelected,
    select, removeAt, removeById, replaceById, autoFill, pending, refresh
  }
}
