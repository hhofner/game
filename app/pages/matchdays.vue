<script setup>
definePageMeta({
  title: 'Matchdays'
})
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
        After the group stage they become <span class="font-medium text-default">day based</span> —
        one per round: round of 32, round of 16, quarter-finals, semi-finals and the final.
      </p>
    </div>

    <EmptyState
      icon="i-lucide-calendar-days"
      text="No matchdays yet"
    />
  </div>
</template>
