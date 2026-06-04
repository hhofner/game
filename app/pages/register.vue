<script setup>
definePageMeta({
  layout: 'auth'
})

const INVITE_CODE = 'deez-nuts'

const { register } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const invite = ref('')
const error = ref('')

function onSubmit() {
  if (!username.value || !email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (invite.value.trim().toLowerCase() !== INVITE_CODE) {
    error.value = 'That invite code isn\'t valid.'
    return
  }
  error.value = ''
  register(username.value)
  navigateTo('/')
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
        Create account
      </h1>
      <p class="text-sm text-muted">
        You'll need an invite code to join.
      </p>
    </div>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="onSubmit"
    >
      <UFormField label="Username">
        <UInput
          v-model="username"
          icon="i-lucide-user"
          placeholder="Pick a username"
          size="lg"
          class="w-full"
        />
      </UFormField>

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
          placeholder="Create a password"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Invite code"
        help="Ask an existing member for the code."
      >
        <UInput
          v-model="invite"
          icon="i-lucide-ticket"
          placeholder="Invite code"
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
        label="Create account"
        size="lg"
        block
      />
    </form>

    <p class="text-center text-sm text-muted">
      Already have an account?
      <ULink
        to="/login"
        class="font-medium text-default"
      >
        Log in
      </ULink>
    </p>
  </div>
</template>
