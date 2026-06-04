<script setup>
defineProps({
  home: { type: Object, required: true },
  away: { type: Object, required: true },
  // optional middle label: score (e.g. "2 - 1") or status; defaults to "VS"
  middle: { type: String, default: 'VS' }
})
</script>

<template>
  <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-default bg-elevated/40 p-3">
    <!-- Home -->
    <div class="flex min-w-0 items-center gap-2">
      <UAvatar
        v-if="home.logo"
        :src="home.logo"
        :alt="home.name"
        size="2xs"
        class="shrink-0"
      />
      <UIcon
        v-else-if="home.flag"
        :name="`i-circle-flags-${home.flag}`"
        class="size-6 shrink-0"
      />
      <span class="truncate text-sm font-medium">{{ home.name }}</span>
    </div>

    <span class="text-xs font-semibold text-muted tabular-nums">{{ middle }}</span>

    <!-- Away (mirrored for balance) -->
    <div class="flex min-w-0 items-center justify-end gap-2">
      <span class="truncate text-sm font-medium">{{ away.name }}</span>
      <UAvatar
        v-if="away.logo"
        :src="away.logo"
        :alt="away.name"
        size="2xs"
        class="shrink-0"
      />
      <UIcon
        v-else-if="away.flag"
        :name="`i-circle-flags-${away.flag}`"
        class="size-6 shrink-0"
      />
    </div>
  </div>
</template>
