<script setup>
const model = defineModel({ type: String, default: '' })

const open = ref(false)

// Preset animated GIFs. Swap these for a Giphy/Tenor search integration later.
const gifs = [
  'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
  'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif',
  'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
  'https://media.giphy.com/media/26gsfPNQAUgY8MGYM/giphy.gif',
  'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif'
]

function choose(url) {
  model.value = url
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Choose your GIF"
    description="Pick an animated profile picture"
  >
    <UButton
      label="Change picture"
      icon="i-lucide-image"
      color="neutral"
      variant="soft"
      size="sm"
    />

    <template #body>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="gif in gifs"
          :key="gif"
          type="button"
          class="overflow-hidden rounded-lg ring-2 transition"
          :class="model === gif ? 'ring-primary' : 'ring-transparent hover:ring-default'"
          @click="choose(gif)"
        >
          <img
            :src="gif"
            alt="GIF option"
            class="aspect-square w-full object-cover"
          >
        </button>
      </div>
    </template>
  </UModal>
</template>
