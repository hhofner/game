<script setup>
definePageMeta({
  title: 'Home'
})

const { selection, removeAt, isFull, autoFill } = useSelection()

const { data: matchdays } = await useFetch('/api/matchdays', { default: () => [] })
const { data: board } = await useFetch('/api/leaderboard', {
  default: () => ({ standings: [] })
})

// Current matchday = earliest not-yet-started, else the earliest one
const now = new Date().toISOString()
const currentIndex = computed(() => {
  const i = matchdays.value.findIndex(m => m.startsAt && m.startsAt > now)
  return i === -1 ? 0 : i
})
const current = computed(() => matchdays.value[currentIndex.value] ?? null)
const upcoming = computed(() => matchdays.value[currentIndex.value + 1] ?? null)
const topThree = computed(() => board.value.standings.slice(0, 3))

function score(g) {
  return g.homeScore != null && g.awayScore != null ? `${g.homeScore} - ${g.awayScore}` : 'VS'
}
</script>

<template>
  <div class="relative flex min-h-full flex-col gap-4 bg-muted p-4">
    <!-- Subtle backdrop accent so the section cards stand out -->
    <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-primary/10 to-transparent" />

    <!-- Current Matchday -->
    <SectionCard
      :title="current ? `Current Matchday · ${current.label}` : 'Current Matchday'"
      icon="i-lucide-calendar-clock"
    >
      <div
        v-if="current"
        class="flex flex-col gap-4"
      >
        <div class="flex flex-col gap-2">
          <MatchCard
            v-for="(g, i) in current.games"
            :key="i"
            :home="g.home"
            :away="g.away"
            :middle="score(g)"
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
      :ui="{ body: 'p-3 sm:p-3' }"
    >
      <div class="grid grid-cols-3 gap-2">
        <SelectionSlot
          v-for="(player, i) in selection"
          :key="i"
          :player="player"
          @remove="removeAt(i)"
        />
      </div>

      <div
        v-if="!isFull"
        class="mt-3 flex items-center justify-between gap-2"
      >
        <p class="text-xs text-muted">
          Empty slots are filled with random players at kickoff.
        </p>
        <UButton
          label="Auto-pick"
          icon="i-lucide-dice-5"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="autoFill"
        />
      </div>
    </SectionCard>

    <!-- Leaderboard -->
    <SectionCard
      title="Leaderboard"
      icon="i-lucide-trophy"
      empty-text="No standings yet"
    >
      <div
        v-if="topThree.length"
        class="flex flex-col gap-2"
      >
        <div
          v-for="player in topThree"
          :key="player.userId"
          class="flex items-center gap-3 rounded-lg border border-default p-2.5"
          :class="rankRowClass(player.rank) || 'bg-elevated/40'"
        >
          <span
            class="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums"
            :class="rankBadgeClass(player.rank)"
          >
            {{ player.rank }}
          </span>
          <UAvatar
            :src="player.avatar || undefined"
            :alt="player.username"
            icon="i-lucide-user"
            size="2xs"
          />
          <span class="flex-1 truncate text-sm font-medium">{{ player.username }}</span>
          <span class="text-sm font-semibold tabular-nums">{{ player.points }}</span>
        </div>
      </div>
    </SectionCard>

    <!-- Upcoming Matchday -->
    <SectionCard
      v-if="upcoming"
      :title="`Upcoming Matchday · ${upcoming.label}`"
      icon="i-lucide-calendar-days"
    >
      <div class="flex flex-col gap-2">
        <MatchCard
          v-for="(g, i) in upcoming.games"
          :key="i"
          :home="g.home"
          :away="g.away"
          middle="VS"
        />
      </div>
    </SectionCard>

    <AppFooter />
  </div>
</template>
