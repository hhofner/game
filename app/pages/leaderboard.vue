<script setup>
definePageMeta({
  title: 'Leaderboard'
})

const matchday = ref(totalMatchdays)

const columns = [
  { accessorKey: 'rank', header: '#' },
  { accessorKey: 'name', header: 'Player' },
  { accessorKey: 'points', header: 'Points' }
]

const rows = computed(() => standingsAt(matchday.value))
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
    />
  </div>
</template>
