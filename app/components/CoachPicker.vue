<script setup>
const model = defineModel({ type: String, default: '' })

const open = ref(false)
const { coaches } = useCoaches()

function choose(coach) {
  model.value = coach.image
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Choose your picture"
    description="Pick a famous coach"
  >
    <UButton
      label="Change picture"
      icon="i-lucide-image"
      color="neutral"
      variant="soft"
      size="sm"
    />

    <template #body>
      <div class="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto pr-1">
        <button
          v-for="coach in coaches"
          :key="coach.name"
          type="button"
          class="flex flex-col items-center gap-1.5"
          @click="choose(coach)"
        >
          <UAvatar
            :src="coach.image"
            :alt="coach.name"
            size="2xl"
            :class="model === coach.image ? 'ring-2 ring-primary ring-offset-2 ring-offset-default' : ''"
          />
          <span class="line-clamp-1 w-full text-center text-[0.65rem] leading-tight text-muted">
            {{ coach.name }}
          </span>
        </button>
      </div>
    </template>
  </UModal>
</template>
