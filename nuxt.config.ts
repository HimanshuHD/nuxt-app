export default defineNuxtConfig({
  compatibilityDate: '2026-08-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-15',

  runtimeConfig: {
    openWeatherApiKey: '',
    openWeatherBaseUrl: 'https://api.openweathermap.org',
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
