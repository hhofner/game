import type { Player } from './usePlayers'

export const MAX_SELECTION = 3

// The user's selected players for the current matchday (fixed slots, nullable)
export function useSelection() {
  const selection = useState<(Player | null)[]>('selection', () => {
    const { players } = usePlayers()
    return [players[0] ?? null, null, null]
  })

  const isSelected = (id: number) => selection.value.some(p => p?.id === id)
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

  function removeById(id: number) {
    const i = selection.value.findIndex(p => p?.id === id)
    if (i !== -1) selection.value[i] = null
  }

  function replaceById(id: number) {
    removeById(id)
    navigateTo('/players')
  }

  return { selection, selected, count, isFull, isSelected, select, removeAt, removeById, replaceById }
}
