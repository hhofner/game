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
// Backed by shared useState so optimistic updates are reactive everywhere.
export function useSelection() {
  const players = useState<Player[]>('selection-players', () => [])
  const matchday = useState<SelectionMatchday | null>('selection-matchday', () => null)
  const loaded = useState('selection-loaded', () => false)
  const saving = useState('selection-saving', () => false)
  const toast = useToast()

  async function load(force = false) {
    if (loaded.value && !force) return
    try {
      const d = await $fetch<SelectionData>('/api/selection')
      players.value = d.players ?? []
      matchday.value = d.matchday ?? null
      loaded.value = true
    } catch {
      // not authenticated yet / nothing to load
    }
  }

  const selected = computed(() => players.value)
  const count = computed(() => players.value.length)
  const isFull = computed(() => count.value >= MAX_SELECTION)
  const isSelected = (id: string) => players.value.some(p => p.id === id)

  // 3 fixed slots for the home grid
  const selection = computed<(Player | null)[]>(() => {
    const s: (Player | null)[] = [...players.value]
    while (s.length < MAX_SELECTION) s.push(null)
    return s.slice(0, MAX_SELECTION)
  })

  async function persist() {
    saving.value = true
    try {
      await $fetch('/api/selection', { method: 'PUT', body: { playerIds: players.value.map(p => p.id) } })
    } catch {
      toast.add({ title: 'Could not save your selection', color: 'error', icon: 'i-lucide-triangle-alert' })
      await load(true) // revert to server truth
    } finally {
      saving.value = false
    }
  }

  async function select(player: Player) {
    if (isSelected(player.id) || players.value.length >= MAX_SELECTION) return
    players.value = [...players.value, player]
    await persist()
  }

  async function removeById(id: string) {
    players.value = players.value.filter(p => p.id !== id)
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
    players.value = next
    await persist()
    toast.add({ title: 'Filled your empty slots', icon: 'i-lucide-dice-5' })
  }

  return {
    selection, selected, matchday, count, isFull, isSelected,
    select, removeAt, removeById, replaceById, autoFill, saving, load
  }
}
