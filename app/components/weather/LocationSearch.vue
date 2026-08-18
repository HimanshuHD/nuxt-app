<script setup lang="ts">
export type LocationSearchResult = {
  name: string
  state?: string
  country: string
  latitude: number
  longitude: number
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    results?: LocationSearchResult[]
    loading?: boolean
    error?: string
  }>(),
  { results: () => [], loading: false, error: '' },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
  select: [location: LocationSearchResult]
  clear: []
}>()

const activeResultIndex = ref(-1)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  emit('search')
  activeResultIndex.value = -1
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    activeResultIndex.value = -1
    return
  }
  if (!props.results.length) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeResultIndex.value = (activeResultIndex.value + 1) % props.results.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeResultIndex.value = activeResultIndex.value <= 0 ? props.results.length - 1 : activeResultIndex.value - 1
  } else if (event.key === 'Enter' && activeResultIndex.value >= 0) {
    event.preventDefault()
    const result = props.results[activeResultIndex.value]
    if (result) emit('select', result)
  }
}

function clear() {
  activeResultIndex.value = -1
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="search-field-wrap">
    <label class="search-field">
      <span>City or location</span>
      <div class="search-input-wrap">
        <input
          :value="modelValue"
          type="text"
          autocomplete="off"
          placeholder="e.g. Delhi, London, Tokyo"
          role="combobox"
          :aria-expanded="loading || results.length > 0"
          aria-controls="location-results"
          :aria-activedescendant="activeResultIndex >= 0 ? `location-result-${activeResultIndex}` : undefined"
          @input="onInput"
          @keydown="onKeydown"
        >
        <span v-if="loading" class="search-loader" aria-label="Searching" role="status" />
        <button v-if="modelValue" class="search-clear" type="button" aria-label="Clear location search" @click="clear">×</button>
      </div>
    </label>

    <div
      v-if="results.length"
      id="location-results"
      class="search-results"
      role="listbox"
      aria-label="Location search results"
    >
      <button
        v-for="(location, index) in results"
        :id="`location-result-${index}`"
        :key="`${location.latitude}-${location.longitude}`"
        class="search-result"
        :class="{ 'search-result--active': index === activeResultIndex }"
        type="button"
        role="option"
        :aria-selected="index === activeResultIndex"
        @mousedown.prevent="emit('select', location)"
      >
        <strong>{{ location.name }}</strong>
        <span>{{ [location.state, location.country].filter(Boolean).join(', ') }}</span>
      </button>
    </div>

    <p v-if="error" class="search-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.search-field-wrap {
  position: relative;
  z-index: 40;
  width: 100%;
  min-width: 0;
}

.search-field {
  display: grid;
  gap: .4rem;
  color: #cbd5e1;
  font-size: .8rem;
  font-weight: 700;
}

.search-input-wrap {
  position: relative;
  width: 100%;
}

.search-field input {
  display: block;
  width: 100%;
  min-width: 0;
  padding: .8rem 5rem .8rem .9rem;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 10px;
  background: rgba(0,0,0,.18);
  color: #f8fafc;
  font: inherit;
}

.search-field input::placeholder {
  color: #64748b;
}

.search-loader {
  position: absolute;
  top: 50%;
  right: 2.75rem;
  width: 15px;
  height: 15px;
  transform: translateY(-50%);
  border: 2px solid rgba(255,255,255,.22);
  border-top-color: #f8fafc;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  pointer-events: none;
}

.search-clear {
  position: absolute;
  top: 50%;
  right: .65rem;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,.08);
  color: #cbd5e1;
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
}

.search-clear:hover {
  background: rgba(255,255,255,.15);
  color: #fff;
}

.search-results {
  position: absolute;
  z-index: 100;
  top: calc(100% + .45rem);
  right: 0;
  left: 0;
  display: grid;
  gap: .35rem;
  max-height: 320px;
  overflow-y: auto;
  margin: 0;
  padding: .4rem;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 14px;
  background: rgba(15,23,42,.98);
  box-shadow: 0 20px 50px rgba(0,0,0,.4);
}

.search-result {
  display: grid;
  gap: .2rem;
  width: 100%;
  padding: .8rem .9rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #f8fafc;
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.search-result:hover,
.search-result--active {
  background: rgba(255,255,255,.08);
}

.search-result span {
  color: #94a3b8;
  font-size: .85rem;
}

.search-error {
  margin: .45rem 0 0;
  color: #fecaca;
  font-size: .85rem;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

@media (max-width: 640px) {
  .search-results {
    max-height: 260px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .search-loader { animation: none; }
}
</style>
