<script setup>
definePageMeta({
  title: 'Leaderboard'
})

const through = ref(999) // server clamps to the latest scored matchday
const { data, pending } = await useFetch('/api/leaderboard', {
  query: { through },
  default: () => ({ through: 0, maxMatchday: 0, standings: [] })
})

const user = useSupabaseUser()
const { isTesting } = useAppMode()

const columns = [
  { accessorKey: 'rank', header: '#' },
  { accessorKey: 'username', header: 'Player' },
  { accessorKey: 'points', header: 'Points' }
]

function prev() {
  through.value = Math.max(1, data.value.through - 1)
}
function next() {
  through.value = Math.min(data.value.maxMatchday, data.value.through + 1)
}

// --- Results animation (test triggers) ---
const resultOpen = ref(false)
const resultPrev = ref([])
const resultNext = ref([])
function withYouAt(base, rank) {
  const you = base.find(p => p.isYou)
  const others = base.filter(p => !p.isYou)
  const arr = [...others]
  arr.splice(rank - 1, 0, you)
  return arr.map((p, i) => ({ ...p, rank: i + 1 }))
}
function testResults(dir) {
  const base = standingsAt(totalMatchdays)
  resultPrev.value = withYouAt(base, dir === 'up' ? 5 : 2)
  resultNext.value = withYouAt(base, dir === 'up' ? 2 : 5)
  resultOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Matchday selector -->
    <div class="flex items-center justify-between rounded-lg border border-default p-1.5">
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        :disabled="data.through <= 1"
        aria-label="Previous matchday"
        @click="prev"
      />
      <span class="text-sm font-semibold">Matchday {{ data.through }}</span>
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        :disabled="data.through >= data.maxMatchday"
        aria-label="Next matchday"
        @click="next"
      />
    </div>

    <UTable
      :loading="pending"
      :data="data.standings"
      :columns="columns"
      :meta="{ class: { tr: row => rankRowClass(row.original.rank) } }"
    >
      <template #rank-cell="{ row }">
        <span
          class="flex size-6 items-center justify-center rounded-full text-xs font-bold tabular-nums"
          :class="rankBadgeClass(row.original.rank)"
        >{{ row.original.rank }}</span>
      </template>

      <template #username-cell="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar
            :src="row.original.avatar || undefined"
            :alt="row.original.username"
            icon="i-lucide-user"
            size="xs"
          />
          <span :class="{ 'font-semibold': row.original.userId === user?.id }">{{ row.original.username }}</span>
        </div>
      </template>
    </UTable>

    <!-- Test panel for the results animation (testing mode only) -->
    <div
      v-if="isTesting"
      class="flex flex-col gap-2 rounded-lg border border-dashed border-default p-3"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">
        Test results animation
      </p>
      <div class="grid grid-cols-2 gap-2">
        <UButton
          label="Moved up"
          icon="i-lucide-trending-up"
          color="neutral"
          variant="soft"
          block
          @click="testResults('up')"
        />
        <UButton
          label="Moved down"
          icon="i-lucide-trending-down"
          color="neutral"
          variant="soft"
          block
          @click="testResults('down')"
        />
      </div>
    </div>

    <MatchdayResultsModal
      v-model:open="resultOpen"
      :previous="resultPrev"
      :next="resultNext"
    />
  </div>
</template>
