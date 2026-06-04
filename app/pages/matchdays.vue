<script setup>
definePageMeta({
  title: 'Matchdays'
})
</script>

<template>
  <div class="flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center">
    <UIcon
      name="i-lucide-calendar-days"
      class="size-10 text-muted"
    />
    <h2 class="text-xl font-bold">
      Matchdays
    </h2>
    <p class="text-sm text-muted">
      No matchdays yet.
    </p>
  </div>
</template>
