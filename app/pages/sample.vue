<script setup lang="ts">
interface Post {
  id: number
  title: string
  body: string
}

const { data: posts, status, error, refresh } = await useFetch<Post[]>(
  'https://jsonplaceholder.typicode.com/posts',
  {
    query: { _limit: 6 },
    key: 'sample-posts',
  },
)
</script>

<template>
  <main class="page">
    <section class="content">
      <NuxtLink class="back" to="/">← Back to home</NuxtLink>
      <p class="eyebrow">Feature Preview</p>
      <h1>Sample API Page</h1>
      <p class="intro">This page loads live demo data from JSONPlaceholder, a free public REST API.</p>

      <div v-if="status === 'pending'" class="state">Loading posts…</div>
      <div v-else-if="error" class="state error">
        <p>We couldn't load the sample data.</p>
        <button class="button" type="button" @click="refresh()">Try again</button>
      </div>
      <div v-else class="grid">
        <article v-for="post in posts" :key="post.id" class="card">
          <span class="number">#{{ post.id }}</span>
          <h2>{{ post.title }}</h2>
          <p>{{ post.body }}</p>
        </article>
      </div>

      <p v-if="posts?.length" class="source">
        Live data from
        <a href="https://jsonplaceholder.typicode.com/" target="_blank" rel="noopener noreferrer">JSONPlaceholder</a>
      </p>
    </section>
  </main>
</template>

<style scoped>
:global(*) { box-sizing: border-box; }
:global(body) { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0b1020; color: #f8fafc; }
.page { min-height: 100vh; padding: 3rem 1.5rem; }
.content { width: min(1100px, 100%); margin: 0 auto; }
.back { display: inline-block; margin-bottom: 3rem; color: #cbd5e1; text-decoration: none; }
.eyebrow { margin: 0 0 .75rem; color: #94a3b8; font-size: .8rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
h1 { margin: 0; font-size: clamp(2.5rem, 7vw, 5rem); line-height: 1; }
.intro { max-width: 680px; margin: 1.25rem 0 3rem; color: #cbd5e1; font-size: 1.1rem; line-height: 1.7; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.card { min-height: 220px; padding: 1.5rem; border: 1px solid rgba(255,255,255,.1); border-radius: 18px; background: rgba(255,255,255,.05); }
.number { color: #94a3b8; font-size: .8rem; font-weight: 700; }
h2 { margin: 1rem 0 .75rem; font-size: 1.2rem; text-transform: capitalize; }
.card p { margin: 0; color: #cbd5e1; line-height: 1.6; }
.state { padding: 2rem; border: 1px solid rgba(255,255,255,.1); border-radius: 18px; color: #cbd5e1; }
.error { color: #fecaca; }
.button { padding: .65rem 1rem; border: 0; border-radius: 999px; background: #fff; color: #0b1020; font-weight: 700; cursor: pointer; }
.source { margin-top: 2rem; color: #94a3b8; font-size: .9rem; }
.source a { color: #e2e8f0; }
</style>
