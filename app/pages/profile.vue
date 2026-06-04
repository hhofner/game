<script setup>
definePageMeta({
  title: 'Profile'
})

const username = 'Player One'
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- User -->
    <div class="flex flex-col items-center gap-3 py-4">
      <UAvatar
        icon="i-lucide-user"
        size="3xl"
      />
      <h2 class="text-lg font-semibold">
        {{ username }}
      </h2>
    </div>

    <!-- Rules of the game -->
    <SectionCard
      title="Rules of the Game"
      icon="i-lucide-book-open"
      empty-text="No rules yet"
    />
  </div>
</template>
