<script setup>
defineProps({
  icon: { type: String, default: 'i-lucide-inbox' },
  text: { type: String, default: 'Nothing here yet' }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-8 text-center">
    <UIcon
      :name="icon"
      class="size-8 text-dimmed"
    />
    <p class="text-xs text-muted">
      {{ text }}
    </p>
  </div>
</template>
