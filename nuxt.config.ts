export default defineNuxtConfig({
  compatibilityDate: '2026-08-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // Nuxt automatically maps NUXT_OPEN_WEATHER_API_KEY and
  // NUXT_OPEN_WEATHER_BASE_URL environment variables to these
  // private runtime config values. Secrets therefore stay server-side.
  runtimeConfig: {
    openWeatherApiKey: '',
    openWeatherBaseUrl: '',
  },

  app: {
    baseURL:
      process.env.NUXT_APP_BASE_URL ||
      (process.env.NODE_ENV === 'production' ? '/nuxt-app/' : '/'),
  },

  nitro: {
    preset: 'github-pages',
  },

  modules: ['@nuxt/eslint'],
})
