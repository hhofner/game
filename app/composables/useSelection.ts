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

export const MAX_SELECTION = 3

// The user's selected players for the current matchday (fixed slots, nullable).
export function useSelection() {
  const selection = useState<(Player | null)[]>('selection', () => [null, null, null])

  const isSelected = (id: string) => selection.value.some(p => p?.id === id)
  const count = computed(() => selection.value.filter(Boolean).length)
  const isFull = computed(() => count.value >= MAX_SELECTION)
  const selected = computed(() => selection.value.filter(Boolean) as Player[])

  function select(player: Player) {
    if (isSelected(player.id)) return
    const i = selection.value.findIndex(s => !s)
    if (i !== -1) selection.value[i] = player
  }

  function removeAt(i: number) {
    selection.value[i] = null
  }

  function removeById(id: string) {
    const i = selection.value.findIndex(p => p?.id === id)
    if (i !== -1) selection.value[i] = null
  }

  function replaceById(id: string) {
    removeById(id)
    navigateTo('/players')
  }

  // Fill empty slots with random players (mirrors the kickoff auto-fill rule).
  async function autoFill() {
    const pool = await $fetch<Player[]>('/api/players')
    const taken = new Set(selection.value.filter(Boolean).map(p => p!.id))
    const available = pool.filter(p => !taken.has(p.id))
    for (let i = 0; i < selection.value.length; i++) {
      if (selection.value[i] || !available.length) continue
      const idx = Math.floor(Math.random() * available.length)
      selection.value[i] = available.splice(idx, 1)[0] ?? null
    }
  }

  return { selection, selected, count, isFull, isSelected, select, removeAt, removeById, replaceById, autoFill }
}
