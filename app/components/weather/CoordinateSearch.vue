<script setup lang="ts">
const props = defineProps<{
  latitude: string
  longitude: string
  loading?: boolean
}>()

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
        <p id="coordinate-heading" class="section-label">
          Search by coordinates
        </p>
        <p id="coordinate-help" class="section-help">
          Enter latitude and longitude directly when you want precise control over the weather location.
        </p>
      </div>

      <form
        class="coordinate-form"
        aria-labelledby="coordinate-heading"
        aria-describedby="coordinate-help"
        @submit.prevent="emit('submit')"
      >
        <label for="latitude">
          <span>Latitude</span>
          <input
            id="latitude"
            :value="props.latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            inputmode="decimal"
            aria-describedby="latitude-range"
            @input="emit('update:latitude', ($event.target as HTMLInputElement).value)"
          >
          <span id="latitude-range" class="field-help">-90 to 90</span>
        </label>

        <label for="longitude">
          <span>Longitude</span>
          <input
            id="longitude"
            :value="props.longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            inputmode="decimal"
            aria-describedby="longitude-range"
            @input="emit('update:longitude', ($event.target as HTMLInputElement).value)"
          >
          <span id="longitude-range" class="field-help">-180 to 180</span>
        </label>

        <button
          class="button button--secondary"
          type="submit"
          :disabled="props.loading"
          :aria-busy="props.loading"
        >
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(9, 18, 35, 0.62);
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.advanced-search summary {
  padding: 1rem 1.25rem;
  color: #cbd5e1;
  font-weight: 700;
  cursor: pointer;
  list-style-position: inside;
}

.advanced-search summary:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
  border-radius: 12px;
}

.advanced-search summary::marker {
  color: #94a3b8;
}

.advanced-search[open] summary {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.advanced-search__content {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
}

.coordinate-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: end;
}

.coordinate-form label {
  display: grid;
  gap: 0.4rem;
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 700;
}

.coordinate-form input {
  width: 100%;
  min-width: 0;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.18);
  color: #f8fafc;
  font: inherit;
}

.coordinate-form input:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.field-help {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 400;
}

@media (max-width: 640px) {
  .coordinate-form {
    grid-template-columns: 1fr;
  }
}
</style>
