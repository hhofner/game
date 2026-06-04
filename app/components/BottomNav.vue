<script setup>
const route = useRoute()
const router = useRouter()

const items = [
  { label: 'Home', to: '/', icon: 'i-lucide-house' },
  { label: 'Matchdays', to: '/matchdays', icon: 'i-lucide-calendar-days' },
  { label: 'Leaderboard', to: '/leaderboard', icon: 'i-lucide-trophy' },
  { label: 'Players', to: '/players', icon: 'i-lucide-users' },
  { label: 'Profile', to: '/profile', icon: 'i-lucide-user' }
]

const isActive = to => (to === '/' ? route.path === '/' : route.path.startsWith(to))

// On the players page the nav morphs into a search bar (iOS 26 style)
const searchMode = computed(() => route.path.startsWith('/players'))
const search = useState('playerSearch', () => '')

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/')
  }
}
</script>

<template>
  <nav
    class="pointer-events-none absolute inset-x-0 bottom-0 z-50 px-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
  >
    <!-- Liquid-glass pill (iOS 26 approximation) -->
    <div
      class="pointer-events-auto flex w-full items-center rounded-full border border-white/50 bg-white/60 p-1 shadow-lg shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-black/40 dark:ring-white/10"
    >
      <Transition
        name="morph"
        mode="out-in"
      >
        <!-- Search mode -->
        <div
          v-if="searchMode"
          key="search"
          class="flex w-full items-center gap-1"
        >
          <UButton
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="ghost"
            size="lg"
            class="shrink-0 rounded-full"
            aria-label="Back"
            @click="goBack"
          />
          <UInput
            v-model="search"
            autofocus
            placeholder="Search players"
            icon="i-lucide-search"
            variant="none"
            class="flex-1"
            :ui="{ root: 'w-full' }"
          />
        </div>

        <!-- Tab mode -->
        <div
          v-else
          key="tabs"
          class="flex w-full items-center gap-0.5"
        >
          <NuxtLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-[0.625rem] font-medium leading-none transition-all duration-200"
            :class="isActive(item.to)
              ? 'bg-primary text-inverted shadow-sm'
              : 'text-muted hover:text-default'"
          >
            <UIcon
              :name="item.icon"
              class="size-5"
            />
            <span class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </Transition>
    </div>
  </nav>
</template>
