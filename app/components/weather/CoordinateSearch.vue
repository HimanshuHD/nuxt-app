<script setup lang="ts">
const props = defineProps<{ latitude: string; longitude: string; loading?: boolean }>()
const emit = defineEmits<{ 'update:latitude': [value: string]; 'update:longitude': [value: string]; submit: [] }>()
</script>
<template>
  <details class="advanced-search"><summary>Advanced search</summary><div class="advanced-search__content"><div><p class="section-label">Test coordinates</p><p class="section-help">Use coordinates directly while validating the weather API.</p></div><form class="coordinate-form" @submit.prevent="emit('submit')"><label>Latitude <input :value="props.latitude" type="number" step="any" min="-90" max="90" inputmode="decimal" @input="emit('update:latitude', ($event.target as HTMLInputElement).value)"></label><label>Longitude <input :value="props.longitude" type="number" step="any" min="-180" max="180" inputmode="decimal" @input="emit('update:longitude', ($event.target as HTMLInputElement).value)"></label><button class="button button--secondary" type="submit" :disabled="props.loading">Get weather</button></form></div></details>
</template>
<style scoped>
.advanced-search{position:relative;z-index:1;margin-bottom:1.25rem;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.025)}.advanced-search summary{padding:.9rem 1rem;color:#cbd5e1;font-weight:700;cursor:pointer}.advanced-search__content{display:grid;gap:1rem;padding:0 1rem 1rem}
</style>
