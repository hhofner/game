<script setup>
definePageMeta({
  title: 'Profile'
})

const { avatar } = useProfile()
const { username, logout } = useAuth()

// Testing-only simulated clock control
const { isTesting } = useAppMode()
const { data: clock, refresh: refreshClock } = useFetch('/api/admin/clock', { default: () => null, immediate: false })
const clockBusy = ref(false)
onMounted(() => {
  if (isTesting.value) refreshClock()
})
async function clockAction(action) {
  clockBusy.value = true
  try {
    await $fetch('/api/admin/clock', { method: 'POST', body: { action } })
    reloadNuxtApp() // refetch selection / leaderboard / matchdays and fire the results modal
  } catch {
    clockBusy.value = false
  }
}
function fmtClock(iso) {
  return iso ? new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- User -->
    <div class="flex flex-col items-center gap-3 py-4">
      <UAvatar
        :src="avatar || undefined"
        :alt="username"
        icon="i-lucide-user"
        size="3xl"
      />
      <h2 class="text-lg font-semibold">
        {{ username }}
      </h2>

      <CoachPicker v-model="avatar" />
    </div>

    <!-- Rules of the game -->
    <SectionCard
      title="Rules of the Game"
      icon="i-lucide-book-open"
    >
      <div class="flex flex-col gap-3 text-sm text-muted">
        <p>
          It's a soccer game. Every matchday comes with a
          <span class="font-medium text-default">challenge</span>, a set of
          criteria your players need to match.
        </p>
        <p>
          Your job is to select
          <span class="font-medium text-default">up to three players</span> that
          fit that matchday's challenge.
        </p>
        <p>
          You earn points based on how well your picks match the criteria. The
          point system changes from matchday to matchday, so the same pick can
          be worth more or less depending on the challenge.
        </p>
        <p>
          Scoring only applies to players who actually play in that matchday. If
          one of your picks doesn't feature, they won't earn you any points.
        </p>
        <p>
          You can change your picks any time before the first kick-off. If you
          haven't chosen three players by then, the empty slots are filled with
          random players automatically.
        </p>
      </div>
    </SectionCard>

    <!-- Simulated clock (testing only) -->
    <div
      v-if="isTesting"
      class="flex flex-col gap-3 rounded-lg border border-dashed border-default p-3"
    >
      <div class="flex items-center justify-between">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted">
          Dev clock
        </p>
        <span class="text-xs text-muted">{{ fmtClock(clock?.now) }}</span>
      </div>
      <p class="text-xs text-muted">
        Picking for: <span class="font-medium text-default">{{ clock?.current?.label || 'season over' }}</span>
      </p>
      <div class="grid grid-cols-2 gap-2">
        <UButton
          label="Reset to start"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="soft"
          block
          :disabled="clockBusy"
          @click="clockAction('reset')"
        />
        <UButton
          label="Play matchday"
          icon="i-lucide-fast-forward"
          color="neutral"
          variant="soft"
          block
          :loading="clockBusy"
          @click="clockAction('advance')"
        />
      </div>
    </div>

    <UButton
      label="Log out"
      icon="i-lucide-log-out"
      color="neutral"
      variant="subtle"
      block
      @click="logout"
    />

    <AppFooter />
  </div>
</template>
