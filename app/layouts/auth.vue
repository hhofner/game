<template>
  <!-- Backdrop fills the viewport on larger screens -->
  <div class="flex h-[100dvh] w-full justify-center bg-muted">
    <!-- Mobile-only viewport (no nav / title bar) -->
    <div class="relative flex h-[100dvh] w-full max-w-[28rem] flex-col overflow-hidden bg-default shadow-xl">
      <BetaBanner />

      <main class="flex flex-1 flex-col justify-center overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
