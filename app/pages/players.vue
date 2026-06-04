<script setup>
definePageMeta({
  title: 'Players'
})

const search = ref('')
const position = ref()
const nation = ref()

const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
const nations = ['France', 'Germany', 'Brazil', 'Argentina', 'Spain', 'Portugal', 'Italy', 'England']
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      size="lg"
      placeholder="Search players"
    />

    <div class="grid grid-cols-2 gap-3">
      <USelect
        v-model="position"
        :items="positions"
        placeholder="Position"
        icon="i-lucide-shirt"
      />
      <USelect
        v-model="nation"
        :items="nations"
        placeholder="Nation"
        icon="i-lucide-flag"
      />
    </div>

    <EmptyState
      icon="i-lucide-users"
      text="No players yet"
    />
  </div>
</template>
