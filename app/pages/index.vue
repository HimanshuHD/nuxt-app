<template>
  <main class="page page--home">
    <section class="hero">
      <p class="eyebrow">Nuxt · Vue · Vite</p>
      <h1>First Nuxt App</h1>
      <p class="intro">
        A production-ready Nuxt application deployed automatically to GitHub Pages.
      </p>
      <div class="actions">
        <a
          class="button button--secondary"
          href="https://nuxt.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore Nuxt
        </a>
        <NuxtLink class="button button--primary" to="/sample">
          View Sample API Page
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
