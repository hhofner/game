<script setup>
const open = defineModel('open', { type: Boolean, default: false })

const props = defineProps({
  // Standings (array of { rank, name, avatar, isYou, points }) before and after the matchday
  previous: { type: Array, default: () => [] },
  next: { type: Array, default: () => [] }
})

const { avatar: profileAvatar } = useProfile()

const phase = ref('intro') // intro | shake | moving | up | down
const rows = ref([])
const confetti = ref([])
const sucks = ref([])

const prevRank = computed(() => props.previous.find(p => p.isYou)?.rank ?? 0)
const nextRank = computed(() => props.next.find(p => p.isYou)?.rank ?? 0)
const wentUp = computed(() => nextRank.value < prevRank.value)

let timers = []
function clearTimers() {
  timers.forEach(clearTimeout)
  timers = []
}
function later(fn, ms) {
  timers.push(setTimeout(fn, ms))
}

const greens = ['#22c55e', '#16a34a', '#4ade80', '#bbf7d0', '#15803d', '#86efac']

function launchConfetti() {
  confetti.value = Array.from({ length: 44 }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.9,
    color: greens[Math.floor(Math.random() * greens.length)],
    size: 6 + Math.random() * 7
  }))
}

function launchSucks() {
  sucks.value = Array.from({ length: 9 }, (_, id) => ({
    id,
    left: 5 + Math.random() * 80,
    top: 5 + Math.random() * 80,
    rotate: -20 + Math.random() * 40,
    scale: 0.7 + Math.random() * 0.9,
    delay: Math.random() * 0.5,
    text: `you suu${'u'.repeat(Math.floor(Math.random() * 4))}ck`
  }))
}

function start() {
  clearTimers()
  confetti.value = []
  sucks.value = []
  phase.value = 'intro'
  rows.value = [...props.previous]

  later(() => (phase.value = 'shake'), 700)
  later(() => {
    phase.value = 'moving'
    rows.value = [...props.next]
  }, 1500)
  later(() => {
    if (wentUp.value) {
      phase.value = 'up'
      launchConfetti()
    } else {
      phase.value = 'down'
      launchSucks()
    }
  }, 2300)
}

function rowSrc(row) {
  return (row.isYou ? profileAvatar.value : row.avatar) || undefined
}

function rowClass(row) {
  if (!row.isYou) return 'border-default bg-elevated/40'
  if (phase.value === 'up') return 'border-green-500 bg-green-500/15'
  if (phase.value === 'down') return 'border-red-500 bg-red-500/15'
  if (phase.value === 'shake') return 'animate-shake border-primary bg-primary/10'
  return 'border-primary bg-primary/10'
}

watch(open, (v) => {
  if (v) start()
  else clearTimers()
})

onBeforeUnmount(clearTimers)
</script>

<template>
  <UDrawer
    v-model:open="open"
    title="Results from last matchday"
    :ui="{ container: 'max-w-md mx-auto w-full' }"
  >
    <template #body>
      <div class="relative overflow-hidden">
        <!-- Standings list (FLIP-animated reorder) -->
        <TransitionGroup
          tag="div"
          name="rank"
          class="relative flex flex-col gap-1"
        >
          <div
            v-for="row in rows"
            :key="row.name"
            class="flex items-center gap-2 rounded-lg border p-2 transition-colors duration-300"
            :class="rowClass(row)"
          >
            <span class="w-5 shrink-0 text-center text-xs font-bold tabular-nums">{{ row.rank }}</span>
            <UAvatar
              :src="rowSrc(row)"
              :alt="row.name"
              icon="i-lucide-user"
              size="xs"
            />
            <span
              class="flex-1 truncate text-sm"
              :class="row.isYou ? 'font-bold' : 'font-medium'"
            >{{ row.name }}</span>
            <span class="text-sm font-semibold tabular-nums">{{ row.points }}</span>
          </div>
        </TransitionGroup>

        <!-- Confetti (climb) -->
        <div
          v-if="phase === 'up'"
          class="pointer-events-none absolute inset-0"
        >
          <span
            v-for="c in confetti"
            :key="c.id"
            class="confetti-piece"
            :style="{
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              backgroundColor: c.color,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`
            }"
          />
        </div>

        <!-- Climb banner -->
        <div
          v-if="phase === 'up'"
          class="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 text-green-600"
        >
          <div class="animate-pop-in flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <UIcon
              name="i-lucide-sparkles"
              class="animate-sparkle size-5"
            />
            <span class="text-base font-extrabold">You climbed to #{{ nextRank }}!</span>
            <UIcon
              name="i-lucide-sparkles"
              class="animate-sparkle size-5"
            />
          </div>
          <span class="animate-pop-in text-3xl font-black tracking-tight text-green-600 drop-shadow-sm">
            LFG!!!
          </span>
        </div>

        <!-- Drop overlay -->
        <div
          v-if="phase === 'down'"
          class="pointer-events-none absolute inset-0 bg-red-500/10"
        >
          <span
            v-for="s in sucks"
            :key="s.id"
            class="animate-pop-in absolute font-black text-red-600"
            :style="{
              left: `${s.left}%`,
              top: `${s.top}%`,
              transform: `rotate(${s.rotate}deg) scale(${s.scale})`,
              animationDelay: `${s.delay}s`
            }"
          >{{ s.text }}</span>

          <div class="absolute inset-x-0 top-0 flex flex-col items-center gap-1">
            <div class="animate-pop-in flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-red-600 shadow-sm backdrop-blur-sm">
              <UIcon
                name="i-lucide-frown"
                class="animate-shake size-5"
              />
              <span class="text-base font-black tracking-tight">Dropped to #{{ nextRank }} 😢</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
