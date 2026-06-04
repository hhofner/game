<script setup>
definePageMeta({
  title: 'Matchdays'
})

const { matchdays } = useMatchdays()

function total(md) {
  return md.picks.reduce((sum, p) => sum + p.points, 0)
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
        Matchdays start out <span class="font-medium text-default">group based</span>.
        After the group stage they become <span class="font-medium text-default">day based</span>,
        one per round: round of 32, round of 16, quarter-finals, semi-finals and the final.
      </p>
    </div>

    <!-- Matchdays -->
    <div class="flex flex-col gap-2">
      <UCollapsible
        v-for="md in matchdays"
        :key="md.number"
        class="group"
        :default-open="md.number === 4"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between gap-2 rounded-lg border border-default p-3 text-left"
        >
          <span class="text-sm font-semibold">Matchday {{ md.number }}</span>
          <span class="flex items-center gap-2">
            <span
              v-if="md.finished"
              class="text-sm font-bold tabular-nums text-primary"
            >+{{ total(md) }} pts</span>
            <UBadge
              v-else
              label="Upcoming"
              color="neutral"
              variant="soft"
              size="sm"
            />
            <UIcon
              name="i-lucide-chevron-down"
              class="size-4 text-dimmed transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </span>
        </button>

        <template #content>
          <div class="flex flex-col gap-4 p-3">
            <!-- Challenge details -->
            <div>
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Challenge
              </p>
              <p class="text-sm font-medium">
                {{ md.challenge.name }}
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
            </div>

            <!-- Games -->
            <div>
              <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Games
              </p>
              <div class="flex flex-col gap-2">
                <MatchCard
                  v-for="game in md.games"
                  :key="`${game.home.flag}-${game.away.flag}`"
                  :home="game.home"
                  :away="game.away"
                />
              </div>
            </div>

            <!-- Your players -->
            <div>
              <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Your players
              </p>
              <div
                v-if="md.picks.length"
                class="flex flex-col gap-1.5"
              >
                <div
                  v-for="p in md.picks"
                  :key="p.name"
                  class="flex items-center gap-2 rounded-lg border border-default bg-elevated/40 p-2"
                >
                  <UIcon
                    :name="`i-circle-flags-${p.flag}`"
                    class="size-5 shrink-0"
                  />
                  <span class="flex-1 truncate text-sm font-medium">{{ p.name }}</span>
                  <span
                    v-if="md.finished"
                    class="text-sm font-bold tabular-nums text-primary"
                  >+{{ p.points }}</span>
                  <span
                    v-else
                    class="text-xs text-dimmed"
                  >pending</span>
                </div>
              </div>
              <p
                v-else
                class="text-xs text-muted"
              >
                You didn't select any players for this matchday.
              </p>
            </div>
          </div>
        </template>
      </UCollapsible>
    </div>
  </div>
</template>
