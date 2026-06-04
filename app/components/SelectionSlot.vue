<script setup>
const selected = defineModel({ type: Boolean, default: false })
</script>

<template>
  <button
    type="button"
    class="flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-all duration-200"
    :class="selected
      ? 'border-primary bg-primary/5 text-primary'
      : 'border-default text-dimmed hover:border-inverted/30'"
    @click="selected = !selected"
  >
    <UIcon
      :name="selected ? 'i-lucide-check' : 'i-lucide-plus'"
      class="size-6"
    />
    <span class="text-[0.7rem] font-medium">{{ selected ? 'Selected' : 'Add' }}</span>
  </button>
</template>
