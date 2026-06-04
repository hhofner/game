<script setup>
definePageMeta({
  title: 'Players'
})

const { players } = usePlayers()
const { selected, isSelected } = useSelection()

// Query is driven by the morphed search bar in the bottom nav
const search = useState('playerSearch', () => '')
const position = ref()
const nation = ref()

const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
const nations = ['France', 'Germany', 'Brazil', 'Argentina', 'Spain', 'Portugal', 'Italy', 'England']

const filtered = computed(() => players.filter(p =>
  (!search.value || p.name.toLowerCase().includes(search.value.toLowerCase()))
  && (!position.value || p.position === position.value)
  && (!nation.value || p.nation === nation.value)
))

const open = ref(false)
const active = ref(null)

function openPlayer(player) {
  active.value = player
  open.value = true
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Players already selected for this matchday -->
    <UCollapsible
      class="group flex flex-col gap-2"
      default-open
    >
      <UButton
        :label="`This Matchday's Players (${selected.length})`"
        color="neutral"
        variant="subtle"
        trailing-icon="i-lucide-chevron-down"
        block
        :ui="{ base: 'justify-between', trailingIcon: 'transition-transform duration-200 group-data-[state=open]:rotate-180' }"
      />

      <template #content>
        <div
          v-if="selected.length"
          class="flex flex-col gap-2 pt-1"
        >
          <button
            v-for="player in selected"
            :key="player.id"
            type="button"
            class="flex items-center gap-3 rounded-lg border border-default bg-elevated/40 p-2.5 text-left transition-colors hover:border-inverted/20"
            @click="openPlayer(player)"
          >
            <UAvatar
              :src="player.avatar || undefined"
              :alt="player.name"
              icon="i-lucide-user"
              size="sm"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                {{ player.name }}
              </p>
              <p class="text-xs text-muted">
                {{ player.position }}
              </p>
            </div>
            <UIcon
              :name="`i-circle-flags-${player.flag}`"
              class="size-5 shrink-0"
            />
          </button>
        </div>
        <EmptyState
          v-else
          icon="i-lucide-user-check"
          text="No players selected for this matchday"
        />
      </template>
    </UCollapsible>

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

    <!-- Results -->
    <div
      v-if="filtered.length"
      class="flex flex-col gap-2"
    >
      <button
        v-for="player in filtered"
        :key="player.id"
        type="button"
        class="flex items-center gap-3 rounded-lg border border-default p-2.5 text-left transition-colors hover:border-inverted/20"
        @click="openPlayer(player)"
      >
        <UAvatar
          :src="player.avatar || undefined"
          :alt="player.name"
          icon="i-lucide-user"
          size="sm"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">
            {{ player.name }}
          </p>
          <p class="flex items-center gap-1 text-xs text-muted">
            <UIcon
              :name="`i-circle-flags-${player.flag}`"
              class="size-3.5 shrink-0"
            />
            {{ player.nation }} · {{ player.position }}
          </p>
        </div>
        <UIcon
          v-if="isSelected(player.id)"
          name="i-lucide-check-circle-2"
          class="size-5 shrink-0 text-primary"
        />
        <UIcon
          name="i-lucide-chevron-right"
          class="size-4 shrink-0 text-dimmed"
        />
      </button>
    </div>
    <EmptyState
      v-else
      icon="i-lucide-users"
      :text="search ? `No players matching “${search}”` : 'No players found'"
    />

    <PlayerDetailDrawer
      v-model:open="open"
      :player="active"
    />
  </div>
</template>
