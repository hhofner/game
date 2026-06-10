<script setup>
definePageMeta({
  title: 'Matchdays'
})

const { data: matchdays, pending } = await useFetch('/api/matchdays')
const { data: mine } = await useFetch('/api/my-matchdays', { default: () => ({}) })

function score(g) {
  return g.homeScore != null && g.awayScore != null ? `${g.homeScore} - ${g.awayScore}` : 'VS'
}

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

function statItems(stats) {
  return STAT_LABELS.filter(s => (stats[s.key] ?? 0) > 0).map(s => ({ label: s.label, value: stats[s.key] }))
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- How matchdays work -->
    <div class="flex gap-3 rounded-lg border border-default bg-elevated/40 p-3">
      <UIcon
        name="i-lucide-info"
        class="mt-0.5 size-4 shrink-0 text-muted"
      />
      <p class="text-xs leading-relaxed text-muted">
        Matchdays start <span class="font-medium text-default">by date</span>, and then after the
        round of 16 are <span class="font-medium text-default">by actual round</span>
        (quarter-finals, semi-finals and the final).
      </p>
    </div>

    <div
      v-if="pending"
      class="flex flex-col gap-2"
    >
      <USkeleton
        v-for="n in 4"
        :key="n"
        class="h-11 w-full"
      />
    </div>

    <div
      v-else
      class="flex flex-col gap-2"
    >
      <UCollapsible
        v-for="(md, i) in matchdays"
        :key="md.number"
        class="group"
        :default-open="i === 0"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between gap-2 rounded-lg border border-default p-3 text-left"
        >
          <span class="text-sm font-semibold">{{ md.label }}</span>
          <span class="flex items-center gap-2">
            <span class="text-xs text-muted">{{ md.games.length }} games</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 text-dimmed transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </span>
        </button>

        <template #content>
          <div class="flex flex-col gap-4 p-3">
            <!-- Challenge -->
            <div>
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Challenge
              </p>
              <template v-if="md.challenge">
                <p class="text-sm font-medium">
                  {{ md.challenge.title }}
                </p>
                <ul class="mt-1.5 flex flex-col gap-1">
                  <li
                    v-for="c in md.challenge.criteria"
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
              </template>
              <p
                v-else-if="md.challengeHidden"
                class="flex items-center gap-1.5 text-sm text-dimmed"
              >
                <UIcon
                  name="i-lucide-lock"
                  class="size-3.5"
                />
                Revealed 2 matchdays before.
              </p>
              <p
                v-else
                class="text-sm text-dimmed"
              >
                Coming soon.
              </p>
            </div>

            <!-- Your players -->
            <div v-if="mine[md.number]">
              <p class="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
                <span>Your players</span>
                <span
                  v-if="mine[md.number].total != null"
                  class="text-primary"
                >+{{ mine[md.number].total }} pts</span>
              </p>
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
                      <span class="rounded bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium tabular-nums text-dimmed">
                        {{ p.stats.minutes }}'
                      </span>
                      <span
                        v-for="s in statItems(p.stats)"
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
              <p
                v-if="mine[md.number].autoFilled"
                class="mt-1 text-[0.7rem] text-dimmed"
              >
                Some slots were auto-filled at kickoff.
              </p>
            </div>

            <!-- Games -->
            <div>
              <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Games
              </p>
              <div class="flex max-h-44 flex-col gap-2 overflow-y-auto">
                <MatchCard
                  v-for="(g, gi) in md.games"
                  :key="gi"
                  :home="g.home"
                  :away="g.away"
                  :middle="score(g)"
                />
              </div>
            </div>
          </div>
        </template>
      </UCollapsible>
    </div>
  </div>
</template>
