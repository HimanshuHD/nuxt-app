export default defineNuxtConfig({
  devtools: { enabled: true },

  compatibilityDate: '2025-07-15',

  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/nuxt-app/' : '/',
  },

  nitro: {
    preset: 'github-pages',
  },

  modules: ['@nuxt/eslint'],
})
