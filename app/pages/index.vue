<script setup>
definePageMeta({
  title: 'Home'
})

const matches = [
  { home: { name: 'France', flag: 'fr' }, away: { name: 'Germany', flag: 'de' } },
  { home: { name: 'Brazil', flag: 'br' }, away: { name: 'Argentina', flag: 'ar' } },
  { home: { name: 'Spain', flag: 'es' }, away: { name: 'Portugal', flag: 'pt' } }
]

const selection = ref([false, false, false])

const topThree = standingsAt(totalMatchdays).slice(0, 3)
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Current Matchday -->
    <SectionCard
      title="Current Matchday"
      icon="i-lucide-calendar-clock"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <MatchCard
            v-for="match in matches"
            :key="`${match.home.flag}-${match.away.flag}`"
            :home="match.home"
            :away="match.away"
          />
        </div>

        <!-- Challenge Details subsection -->
        <div>
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Challenge Details
          </h4>
          <div class="rounded-lg border border-dashed border-default">
            <EmptyState
              icon="i-lucide-target"
              text="No challenge details yet"
            />
          </div>
        </div>
      </div>
    </SectionCard>

    <!-- Your Selection -->
    <SectionCard
      title="Your Selection"
      icon="i-lucide-clipboard-list"
    >
      <div class="grid grid-cols-3 gap-3">
        <SelectionSlot
          v-for="(_, i) in selection"
          :key="i"
          v-model="selection[i]"
        />
      </div>
    </SectionCard>

    <!-- Leaderboard -->
    <SectionCard
      title="Leaderboard"
      icon="i-lucide-trophy"
    >
      <div class="flex flex-col gap-2">
        <div
          v-for="player in topThree"
          :key="player.name"
          class="flex items-center gap-3 rounded-lg border border-default bg-elevated/40 p-2.5"
        >
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-inverted">
            {{ player.rank }}
          </span>
          <span class="flex-1 truncate text-sm font-medium">{{ player.name }}</span>
          <span class="text-sm font-semibold tabular-nums">{{ player.points }}</span>
        </div>
      </div>
    </SectionCard>

    <!-- Upcoming Matchday -->
    <SectionCard
      title="Upcoming Matchday"
      icon="i-lucide-calendar-days"
    />
  </div>
</template>
