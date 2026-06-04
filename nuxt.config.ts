// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase'
  ],

  devtools: {
    enabled: true
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only secret (set via NUXT_API_FOOTBALL_KEY). Supabase keys are
    // handled by @nuxtjs/supabase.
    apiFootballKey: '',
    public: {
      // 'testing' | 'production' (override via NUXT_PUBLIC_APP_MODE).
      // Testing exposes admin/sandbox triggers and the beta banner.
      appMode: 'testing'
    }
  },

  // SSR (no prerender): dynamic data is served via Nitro server routes
  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  supabase: {
    // Reads SUPABASE_URL / SUPABASE_KEY / NUXT_SUPABASE_SECRET_KEY from env.
    // We run our own auth middleware (invite gate + auth-page allowlist).
    redirect: false
  }
})
