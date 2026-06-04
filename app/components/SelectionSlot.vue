<script setup>
defineProps({
  player: { type: Object, default: null }
})

defineEmits(['remove'])
</script>

<template>
  <!-- Empty slot: tapping "Add" jumps to the players page (search autofocuses there) -->
  <NuxtLink
    v-if="!player"
    to="/players"
    class="flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-default text-dimmed transition-all duration-200 hover:border-inverted/30 hover:text-muted"
  >
    <UIcon
      name="i-lucide-plus"
      class="size-6"
    />
    <span class="text-[0.7rem] font-medium">Add</span>
  </NuxtLink>

  <!-- Filled slot (same footprint as the empty slot) -->
  <div
    v-else
    class="flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-primary/60 bg-primary/5 p-2 text-center"
  >
    <UAvatar
      :src="player.photo || undefined"
      :alt="player.name"
      icon="i-lucide-user"
      size="md"
    />

    <span class="line-clamp-1 w-full text-[0.7rem] font-semibold leading-tight">
      {{ player.name }}
    </span>
    <span class="flex items-center gap-1 text-[0.65rem] text-muted">
      <UAvatar
        v-if="player.teamLogo"
        :src="player.teamLogo"
        :alt="player.nation"
        size="3xs"
      />
      {{ player.position || player.nation }}
    </span>

    <div class="flex gap-1">
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        square
        aria-label="Remove player"
        @click="$emit('remove')"
      />
      <UButton
        icon="i-lucide-repeat"
        color="neutral"
        variant="soft"
        size="xs"
        square
        aria-label="Replace player"
        to="/players"
      />
    </div>
  </div>
</template>
