<script setup>
const open = defineModel('open', { type: Boolean, default: false })

const props = defineProps({
  player: { type: Object, default: null }
})

const { isSelected, isFull, select, removeById, replaceById } = useSelection()

const selected = computed(() => !!props.player && isSelected(props.player.id))

const stats = computed(() => props.player
  ? [
      { label: 'Goals', value: props.player.goals ?? 0 },
      { label: 'Assists', value: props.player.assists ?? 0 },
      { label: 'Apps', value: props.player.apps ?? 0 }
    ]
  : [])

function onSelect() {
  select(props.player)
  open.value = false
}
function onRemove() {
  removeById(props.player.id)
  open.value = false
}
function onReplace() {
  open.value = false
  replaceById(props.player.id)
}
</script>

<template>
  <UDrawer
    v-model:open="open"
    :title="player?.name || 'Player'"
    :ui="{ container: 'max-w-md mx-auto w-full' }"
  >
    <template #body>
      <div
        v-if="player"
        class="flex flex-col items-center gap-3 pb-2 text-center"
      >
        <UAvatar
          :src="player.photo || undefined"
          :alt="player.name"
          icon="i-lucide-user"
          size="3xl"
        />

        <div class="flex flex-col items-center gap-1">
          <h3 class="text-xl font-bold leading-tight">
            {{ player.name }}
          </h3>
          <span class="flex items-center gap-1.5 text-sm text-muted">
            <UAvatar
              v-if="player.teamLogo"
              :src="player.teamLogo"
              :alt="player.nation"
              size="3xs"
            />
            {{ player.nation }}
          </span>
        </div>

        <UBadge
          v-if="player.position"
          :label="player.position"
          color="neutral"
          variant="soft"
        />

        <!-- Tournament totals -->
        <div class="grid w-full grid-cols-3 gap-2 pt-1">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex flex-col items-center gap-0.5 rounded-lg border border-default bg-elevated/40 py-2.5"
          >
            <span class="text-lg font-bold tabular-nums">{{ stat.value }}</span>
            <span class="text-[0.7rem] text-muted">{{ stat.label }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="w-full pt-2">
          <div
            v-if="selected"
            class="grid grid-cols-2 gap-2"
          >
            <UButton
              label="Replace"
              icon="i-lucide-repeat"
              color="neutral"
              variant="soft"
              block
              @click="onReplace"
            />
            <UButton
              label="Remove"
              icon="i-lucide-x"
              color="error"
              variant="soft"
              block
              @click="onRemove"
            />
          </div>

          <template v-else>
            <UButton
              label="Select"
              icon="i-lucide-check"
              block
              size="lg"
              :disabled="isFull"
              @click="onSelect"
            />
            <p
              v-if="isFull"
              class="pt-2 text-center text-xs text-muted"
            >
              Selection full ({{ MAX_SELECTION }}/{{ MAX_SELECTION }}) — remove a player first.
            </p>
          </template>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
