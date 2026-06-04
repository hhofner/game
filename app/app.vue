<script setup>
useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Game'
const description = 'A mobile game.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'Game')
</script>

<template>
  <UApp>
    <!-- Backdrop fills the viewport on larger screens -->
    <div class="flex h-[100dvh] w-full justify-center bg-muted">
      <!-- Mobile-only viewport -->
      <div class="relative flex h-[100dvh] w-full max-w-[28rem] flex-col overflow-hidden bg-default shadow-xl">
        <!-- Top title bar -->
        <header class="flex h-14 shrink-0 items-center justify-center border-b border-default px-4">
          <h1 class="text-lg font-semibold tracking-tight">
            {{ pageTitle }}
          </h1>
        </header>

        <!-- Scrollable screen content -->
        <main class="flex-1 overflow-y-auto pb-28">
          <NuxtPage />
        </main>

        <!-- Glass bottom navigation -->
        <BottomNav />
      </div>
    </div>
  </UApp>
</template>
