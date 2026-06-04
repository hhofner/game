<script setup>
definePageMeta({
  layout: 'auth'
})

const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not log in.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col items-center gap-2 text-center">
      <UIcon
        name="i-lucide-volleyball"
        class="size-10"
      />
      <h1 class="text-2xl font-bold">
        Welcome back
      </h1>
      <p class="text-sm text-muted">
        Log in to make your picks.
      </p>
    </div>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="onSubmit"
    >
      <UFormField label="Email">
        <UInput
          v-model="email"
          type="email"
          icon="i-lucide-mail"
          placeholder="you@example.com"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Password">
        <UInput
          v-model="password"
          type="password"
          icon="i-lucide-lock"
          placeholder="Your password"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <p
        v-if="error"
        class="text-xs text-error"
      >
        {{ error }}
      </p>

      <UButton
        type="submit"
        label="Log in"
        size="lg"
        block
        :loading="loading"
      />
    </form>

    <p class="text-center text-sm text-muted">
      Don't have an account?
      <ULink
        to="/register"
        class="font-medium text-default"
      >
        Register
      </ULink>
    </p>
  </div>
</template>
