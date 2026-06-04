<script setup>
definePageMeta({
  title: 'Matchdays'
})

const { data: matchdays, pending } = await useFetch('/api/matchdays')

function score(g) {
  return g.homeScore != null && g.awayScore != null ? `${g.homeScore} - ${g.awayScore}` : 'VS'
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
            <!-- Challenge (placeholder until the challenge pool is authored) -->
            <div>
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Challenge
              </p>
              <p class="text-sm text-dimmed">
                Coming soon.
              </p>
            </div>

            <!-- Games -->
            <div>
              <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Games
              </p>
              <div class="flex flex-col gap-2">
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
