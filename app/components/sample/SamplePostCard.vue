<script setup lang="ts">
import type { SamplePost } from '~/types/sample'

defineProps<{
  post: SamplePost
}>()
</script>

<template>
  <article class="card">
    <span class="number">#{{ post.id }}</span>
    <h2>{{ post.title }}</h2>
    <p>{{ post.body }}</p>
  </article>
</template>
