<script setup>
defineProps({
  home: { type: Object, required: true },
  away: { type: Object, required: true }
})
</script>

<template>
  <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-default bg-elevated/40 p-3">
    <!-- Home -->
    <div class="flex min-w-0 items-center gap-2">
      <UIcon
        :name="`i-circle-flags-${home.flag}`"
        class="size-6 shrink-0"
      />
      <span class="truncate text-sm font-medium">{{ home.name }}</span>
    </div>

    <span class="text-xs font-semibold text-muted">VS</span>

    <!-- Away (mirrored for balance) -->
    <div class="flex min-w-0 items-center justify-end gap-2">
      <span class="truncate text-sm font-medium">{{ away.name }}</span>
      <UIcon
        :name="`i-circle-flags-${away.flag}`"
        class="size-6 shrink-0"
      />
    </div>
  </div>
</template>
