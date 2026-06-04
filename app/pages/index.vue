<script setup>
definePageMeta({
  title: 'Home'
})

const matches = [
  { home: { name: 'France', flag: 'fr' }, away: { name: 'Germany', flag: 'de' } },
  { home: { name: 'Brazil', flag: 'br' }, away: { name: 'Argentina', flag: 'ar' } },
  { home: { name: 'Spain', flag: 'es' }, away: { name: 'Portugal', flag: 'pt' } }
]

const upcomingMatches = [
  { home: { name: 'England', flag: 'gb-eng' }, away: { name: 'Italy', flag: 'it' } },
  { home: { name: 'Netherlands', flag: 'nl' }, away: { name: 'Belgium', flag: 'be' } },
  { home: { name: 'Croatia', flag: 'hr' }, away: { name: 'Japan', flag: 'jp' } }
]

const topThree = standingsAt(totalMatchdays).slice(0, 3)
const { avatar: profileAvatar } = useProfile()
const { selection, removeAt } = useSelection()
</script>

<template>
  <div class="relative flex min-h-full flex-col gap-4 bg-muted p-4">
    <!-- Subtle backdrop accent so the section cards stand out -->
    <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-primary/10 to-transparent" />

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
            :src="(player.isYou ? profileAvatar : player.avatar) || undefined"
            :alt="player.name"
            icon="i-lucide-user"
            size="2xs"
          />
          <span class="flex-1 truncate text-sm font-medium">{{ player.name }}</span>
          <span class="text-sm font-semibold tabular-nums">{{ player.points }}</span>
        </div>
      </div>
    </SectionCard>

    <!-- Upcoming Matchday -->
    <SectionCard
      title="Upcoming Matchday"
      icon="i-lucide-calendar-days"
    >
      <div class="flex flex-col gap-2">
        <MatchCard
          v-for="match in upcomingMatches"
          :key="`${match.home.flag}-${match.away.flag}`"
          :home="match.home"
          :away="match.away"
        />
      </div>
    </SectionCard>

    <AppFooter />
  </div>
</template>
