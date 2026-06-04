<script setup>
const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'Game')

// Show last matchday's results once, when the user returns after it finished.
const resultsOpen = ref(false)
const resultsPrev = ref([])
const resultsNext = ref([])
onMounted(async () => {
  try {
    const r = await $fetch('/api/results/unseen')
    if (r && r.matchday) {
      resultsPrev.value = r.previous
      resultsNext.value = r.next
      resultsOpen.value = true
      await $fetch('/api/results/seen', { method: 'POST', body: { matchday: r.matchday } })
    }
  } catch {
    // not logged in / nothing to show
  }
})
</script>

<template>
  <!-- Backdrop fills the viewport on larger screens -->
  <div class="flex h-[100dvh] w-full justify-center bg-muted">
    <!-- Mobile-only viewport -->
    <div class="relative flex h-[100dvh] w-full max-w-[28rem] flex-col overflow-hidden bg-default shadow-xl">
      <BetaBanner />

      <!-- Top title bar -->
      <header class="flex h-14 shrink-0 items-center justify-center border-b border-default px-4">
        <h1 class="text-lg font-semibold tracking-tight">
          {{ pageTitle }}
        </h1>
      </header>

      <!-- Scrollable screen content -->
      <main class="flex-1 overflow-y-auto pb-28">
        <slot />
      </main>

      <!-- Glass bottom navigation -->
      <BottomNav />

      <!-- Returning-user results animation -->
      <MatchdayResultsModal
        v-model:open="resultsOpen"
        :previous="resultsPrev"
        :next="resultsNext"
      />
    </div>
  </div>
</template>
