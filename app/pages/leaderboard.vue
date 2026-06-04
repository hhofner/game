<script setup>
definePageMeta({
  title: 'Leaderboard'
})

const matchday = ref(totalMatchdays)
const { avatar: profileAvatar } = useProfile()
const { isTesting } = useAppMode()

const columns = [
  { accessorKey: 'rank', header: '#' },
  { accessorKey: 'name', header: 'Player' },
  { accessorKey: 'points', header: 'Points' }
]

const rows = computed(() => standingsAt(matchday.value))

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
        :disabled="matchday <= 1"
        aria-label="Previous matchday"
        @click="matchday--"
      />
      <span class="text-sm font-semibold">Matchday {{ matchday }}</span>
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        :disabled="matchday >= totalMatchdays"
        aria-label="Next matchday"
        @click="matchday++"
      />
    </div>

    <UTable
      :data="rows"
      :columns="columns"
      :meta="{ class: { tr: row => rankRowClass(row.original.rank) } }"
    >
      <template #rank-cell="{ row }">
        <span
          class="flex size-6 items-center justify-center rounded-full text-xs font-bold tabular-nums"
          :class="rankBadgeClass(row.original.rank)"
        >{{ row.original.rank }}</span>
      </template>

      <template #name-cell="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar
            :src="(row.original.isYou ? profileAvatar : row.original.avatar) || undefined"
            :alt="row.original.name"
            icon="i-lucide-user"
            size="xs"
          />
          <span :class="{ 'font-semibold': row.original.isYou }">{{ row.original.name }}</span>
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
