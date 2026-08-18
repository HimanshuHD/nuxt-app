<script setup lang="ts">
const props = defineProps<{ latitude: string; longitude: string; loading?: boolean }>()
const emit = defineEmits<{
  'update:latitude': [value: string]
  'update:longitude': [value: string]
  submit: []
}>()
</script>

<template>
  <details class="advanced-search">
    <summary>Advanced search</summary>
    <div class="advanced-search__content">
      <div>
        <p class="section-label">Search by coordinates</p>
        <p class="section-help">Enter latitude and longitude directly when you want precise control over the weather location.</p>
      </div>

      <form class="coordinate-form" @submit.prevent="emit('submit')">
        <label>
          <span>Latitude</span>
          <input
            :value="props.latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            inputmode="decimal"
            @input="emit('update:latitude', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <label>
          <span>Longitude</span>
          <input
            :value="props.longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            inputmode="decimal"
            @input="emit('update:longitude', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <button class="button button--secondary" type="submit" :disabled="props.loading">
          {{ props.loading ? 'Loading…' : 'Get weather' }}
        </button>
      </form>
    </div>
  </details>
</template>

<style scoped>
.advanced-search {
  position: relative;
  z-index: 5;
  margin-bottom: 1rem;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px;
  background: rgba(9,18,35,.62);
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
}

.advanced-search summary {
  padding: 1rem 1.25rem;
  color: #cbd5e1;
  font-weight: 700;
  cursor: pointer;
  list-style-position: inside;
}

.advanced-search summary::marker {
  color: #94a3b8;
}

.advanced-search[open] summary {
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.advanced-search__content {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
}

.coordinate-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: .75rem;
  align-items: end;
}

.coordinate-form label {
  display: grid;
  gap: .4rem;
  color: #cbd5e1;
  font-size: .8rem;
  font-weight: 700;
}

.coordinate-form input {
  width: 100%;
  min-width: 0;
  padding: .8rem .9rem;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 10px;
  background: rgba(0,0,0,.18);
  color: #f8fafc;
  font: inherit;
}

.coordinate-form input:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .coordinate-form {
    grid-template-columns: 1fr;
  }
}
</style>
