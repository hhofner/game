<script setup>
definePageMeta({
  title: 'Home'
})

const { selection, removeAt, isFull, autoFill, saving } = useSelection()

const { data: matchdays } = await useFetch('/api/matchdays', { default: () => [] })
const { data: board } = await useFetch('/api/leaderboard', { default: () => ({ standings: [] }) })
const { data: mine } = await useFetch('/api/my-matchdays', { default: () => ({}) })

// Current matchday = earliest not-yet-started, else the earliest one
const now = new Date().toISOString()
const currentIndex = computed(() => {
  const i = matchdays.value.findIndex(m => m.startsAt && m.startsAt > now)
  return i === -1 ? 0 : i
})
const current = computed(() => matchdays.value[currentIndex.value] ?? null)
const upcoming = computed(() => matchdays.value[currentIndex.value + 1] ?? null)
const topThree = computed(() => board.value.standings.slice(0, 3))

// Past matchdays: before the current index and the user has a selection for them
const pastMatchdays = computed(() =>
  matchdays.value
    .slice(0, currentIndex.value)
    .filter(md => mine.value[md.number])
    .reverse()
)

function score(g) {
  return g.homeScore != null && g.awayScore != null ? `${g.homeScore} - ${g.awayScore}` : 'VS'
}

// ── Past matchday stats helpers ───────────────────────────────────────────

const STAT_LABELS = [
  { key: 'goals', label: 'G' },
  { key: 'assists', label: 'A' },
  { key: 'key_passes', label: 'KP' },
  { key: 'shots_on_target', label: 'SoT' },
  { key: 'tackles', label: 'T' },
  { key: 'interceptions', label: 'Int' },
  { key: 'saves', label: 'Sv' },
  { key: 'yellow', label: '🟨' },
  { key: 'red', label: '🟥' }
]

const STAT_NAMES = {
  goals: 'Goals', assists: 'Assists', key_passes: 'Key Passes',
  shots_on_target: 'Shots on Target', tackles: 'Tackles',
  interceptions: 'Interceptions', saves: 'Saves', clean_sheet: 'Clean Sheets'
}

function playerStatItems(stats) {
  return STAT_LABELS.filter(s => (stats[s.key] ?? 0) > 0).map(s => ({ label: s.label, value: stats[s.key] }))
}

function aggregateStats(players) {
  const agg = {}
  for (const p of players) {
    if (!p.stats) continue
    for (const [k, v] of Object.entries(p.stats)) {
      if (k === 'clean_sheet') agg.clean_sheet = (agg.clean_sheet ?? 0) + (v ? 1 : 0)
      else agg[k] = (agg[k] ?? 0) + (Number(v) || 0)
    }
  }
  return agg
}

function thresholdResults(scoringRules, agg) {
  if (!scoringRules) return []
  return Object.entries(scoringRules)
    .filter(([, r]) => r && typeof r === 'object' && 'threshold' in r)
    .map(([stat, r]) => ({
      label: STAT_NAMES[stat] || stat,
      threshold: r.threshold,
      points: r.points,
      total: agg[stat] ?? 0,
      passed: (agg[stat] ?? 0) >= r.threshold
    }))
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
        <div class="flex max-h-44 flex-col gap-2 overflow-y-auto">
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
          <div
            v-if="current.challenge"
            class="rounded-lg border border-default bg-elevated/40 p-3"
          >
            <p class="text-sm font-medium">
              {{ current.challenge.title }}
            </p>
            <ul class="mt-1.5 flex flex-col gap-1">
              <li
                v-for="c in current.challenge.criteria"
                :key="c"
                class="flex items-start gap-2 text-xs text-muted"
              >
                <UIcon
                  name="i-lucide-target"
                  class="mt-0.5 size-3.5 shrink-0"
                />
                {{ c }}
              </li>
            </ul>
          </div>
          <div
            v-else
            class="rounded-lg border border-dashed border-default"
          >
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
          :loading="saving"
          @click="autoFill"
        />
      </div>
    </SectionCard>

    <!-- Past Matchdays -->
    <SectionCard
      v-if="pastMatchdays.length"
      title="Past Matchdays"
      icon="i-lucide-history"
    >
      <div class="flex flex-col gap-4">
        <div
          v-for="md in pastMatchdays"
          :key="md.number"
          class="flex flex-col gap-3"
        >
          <!-- Header -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-semibold">{{ md.label }}</span>
            <template v-if="mine[md.number].total != null">
              <UBadge
                v-if="mine[md.number].total > 0"
                color="success"
                variant="subtle"
                size="sm"
              >
                +{{ mine[md.number].total }} pts
              </UBadge>
              <UBadge
                v-else
                color="neutral"
                variant="subtle"
                size="sm"
              >
                0 pts
              </UBadge>
            </template>
            <span
              v-else
              class="text-xs text-dimmed"
            >pending</span>
          </div>

          <!-- Threshold results -->
          <div
            v-if="md.challenge && mine[md.number].players.some(p => p.stats)"
            class="flex flex-col gap-1 rounded-lg border border-default bg-elevated/40 p-2.5"
          >
            <p class="mb-1 text-xs font-semibold text-muted">
              {{ md.challenge.title }}
            </p>
            <div
              v-for="t in thresholdResults(md.challenge.scoring_rules, aggregateStats(mine[md.number].players))"
              :key="t.label"
              class="flex items-center gap-2 text-xs"
            >
              <UIcon
                :name="t.passed ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
                class="size-3.5 shrink-0"
                :class="t.passed ? 'text-success' : 'text-muted'"
              />
              <span class="flex-1">{{ t.label }}</span>
              <span class="tabular-nums text-dimmed">{{ t.total }} / {{ t.threshold }}</span>
              <span
                v-if="t.passed"
                class="font-medium text-primary"
              >+{{ t.points }}</span>
            </div>
          </div>

          <!-- Players -->
          <div class="flex flex-col gap-1.5">
            <div
              v-for="(p, pi) in mine[md.number].players"
              :key="pi"
              class="flex items-start gap-2 rounded-lg border border-default bg-elevated/40 p-2"
            >
              <UAvatar
                :src="p.photo || undefined"
                :alt="p.name"
                icon="i-lucide-user"
                size="2xs"
                class="mt-0.5 shrink-0"
              />
              <div class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium">{{ p.name }}</span>
                <div
                  v-if="p.stats"
                  class="mt-1 flex flex-wrap gap-1"
                >
                  <span class="rounded bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium tabular-nums text-dimmed">{{ p.stats.minutes }}'</span>
                  <span
                    v-for="s in playerStatItems(p.stats)"
                    :key="s.label"
                    class="rounded bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium tabular-nums"
                  >{{ s.value }} {{ s.label }}</span>
                  <span
                    v-if="p.stats.clean_sheet"
                    class="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary"
                  >CS</span>
                </div>
                <span
                  v-else
                  class="text-xs text-dimmed"
                >pending</span>
              </div>
            </div>
          </div>

          <UDivider
            v-if="pastMatchdays.indexOf(md) < pastMatchdays.length - 1"
            class="mt-1"
          />
        </div>
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
      <div class="flex max-h-44 flex-col gap-2 overflow-y-auto">
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
