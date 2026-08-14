<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Nuxt · Vue · Vite</p>
      <h1>First Nuxt App</h1>
      <p class="intro">
        A production-ready Nuxt application deployed automatically to GitHub Pages.
      </p>
      <div class="actions">
        <a
          class="button secondary"
          href="https://nuxt.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore Nuxt
        </a>
        <NuxtLink class="button" to="/sample">
          View Sample API Page
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #0b1020;
  color: #f8fafc;
}

.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.hero {
  width: min(720px, 100%);
  padding: 4rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  text-align: center;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

.eyebrow {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.7;
}

h1 {
  margin: 0;
  font-size: clamp(3rem, 10vw, 6rem);
  line-height: 0.95;
}

.intro {
  max-width: 560px;
  margin: 1.5rem auto 2rem;
  font-size: 1.15rem;
  line-height: 1.7;
  opacity: 0.75;
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.button {
  display: inline-block;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  background: #fff;
  color: #0b1020;
  font-weight: 700;
  text-decoration: none;
}

.button.secondary {
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: #f8fafc;
}
</style>
