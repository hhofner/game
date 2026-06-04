<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'i-lucide-inbox' },
  emptyText: { type: String, default: 'Nothing here yet' }
})

const slots = useSlots()
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-sm font-semibold">
        {{ title }}
      </h3>
    </template>

    <!-- Render provided content, otherwise a generic empty state -->
    <slot v-if="slots.default" />
    <EmptyState
      v-else
      :icon="icon"
      :text="emptyText"
    />
  </UCard>
</template>
