<script setup lang="ts">
import type { CurrentWeather } from '~/shared/types/weather'

type LocationResult = {
  name: string
  state?: string
  country: string
  latitude: number
  longitude: number
}

const weather = ref<CurrentWeather | null>(null)
const loading = ref(false)
const searchLoading = ref(false)
const errorMessage = ref('')
const searchError = ref('')
const searchQuery = ref('')
const searchResults = ref<LocationResult[]>([])
const latitude = ref('28.6139')
const longitude = ref('77.2090')
const activeResultIndex = ref(-1)

const toast = useToast()
let searchTimer: ReturnType<typeof setTimeout> | undefined
let searchRequestId = 0

async function fetchWeather(lat = Number(latitude.value), lon = Number(longitude.value)) {
  errorMessage.value = ''
  loading.value = true

  try {
    weather.value = await $fetch<CurrentWeather>('/api/weather', { query: { lat, lon } })
    toast.success('Weather data updated successfully.')
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
    toast.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

function scheduleLocationSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  const query = searchQuery.value.trim()
  searchError.value = ''
  searchResults.value = []
  activeResultIndex.value = -1

  if (query.length < 2) {
    searchLoading.value = false
    return
  }

  searchLoading.value = true
  const requestId = ++searchRequestId
  searchTimer = setTimeout(async () => {
    try {
      const results = await $fetch<LocationResult[]>('/api/geocode', { query: { q: query } })
      if (requestId !== searchRequestId || query !== searchQuery.value.trim()) return
      searchResults.value = results
      if (results.length === 0) searchError.value = 'No matching locations found. Try a city or country name.'
    } catch (error: unknown) {
      if (requestId !== searchRequestId) return
      searchError.value = getErrorMessage(error)
      toast.error(searchError.value)
    } finally {
      if (requestId === searchRequestId) searchLoading.value = false
    }
  }, 300)
}

function selectLocation(location: LocationResult) {
  latitude.value = location.latitude.toFixed(4)
  longitude.value = location.longitude.toFixed(4)
  searchQuery.value = [location.name, location.state, location.country].filter(Boolean).join(', ')
  searchResults.value = []
  searchError.value = ''
  activeResultIndex.value = -1
  if (searchTimer) clearTimeout(searchTimer)
  void fetchWeather(location.latitude, location.longitude)
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (!searchResults.value.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeResultIndex.value = (activeResultIndex.value + 1) % searchResults.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeResultIndex.value = activeResultIndex.value <= 0 ? searchResults.value.length - 1 : activeResultIndex.value - 1
  } else if (event.key === 'Enter' && activeResultIndex.value >= 0) {
    event.preventDefault()
    selectLocation(searchResults.value[activeResultIndex.value])
  } else if (event.key === 'Escape') {
    searchResults.value = []
    activeResultIndex.value = -1
  }
}

function useCurrentLocation() {
  errorMessage.value = ''
  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported by this browser.'
    toast.error(errorMessage.value)
    return
  }
  loading.value = true
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      latitude.value = coords.latitude.toFixed(4)
      longitude.value = coords.longitude.toFixed(4)
      void fetchWeather(coords.latitude, coords.longitude)
    },
    (error) => {
      loading.value = false
      errorMessage.value = getGeolocationError(error.code)
      toast.error(errorMessage.value)
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  )
}

function submitCoordinates() {
  const lat = Number(latitude.value)
  const lon = Number(longitude.value)
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    errorMessage.value = 'Latitude must be a number between -90 and 90.'
    toast.error(errorMessage.value)
    return
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    errorMessage.value = 'Longitude must be a number between -180 and 180.'
    toast.error(errorMessage.value)
    return
  }
  void fetchWeather(lat, lon)
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'statusMessage' in error) {
    const statusMessage = error.statusMessage
    if (typeof statusMessage === 'string') return statusMessage
  }
  return 'Unable to load weather data. Please try again.'
}

function getGeolocationError(code: number) {
  if (code === 1) return 'Location permission was denied. You can enter coordinates manually.'
  if (code === 2) return 'Your location could not be determined. Try again or enter coordinates manually.'
  if (code === 3) return 'Location request timed out. Try again or enter coordinates manually.'
  return 'Unable to determine your location.'
}

function weatherIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

function formatTemperature(value: number) {
  return `${Math.round(value)}°`
}
</script>

<template>
  <main class="page weather-page">
    <div class="content weather-content">
      <NuxtLink class="back" to="/">← Back to home</NuxtLink>
      <header class="weather-header">
        <div>
          <p class="eyebrow">Nuxt · OpenWeatherMap</p>
          <h1>Weather Dashboard</h1>
          <p class="intro">Check current weather using your location, a city search, or coordinates.</p>
        </div>
        <button class="button button--primary" type="button" :disabled="loading" @click="useCurrentLocation">
          {{ loading ? 'Loading…' : 'Use my location' }}
        </button>
      </header>

      <section class="location-panel" aria-labelledby="location-heading">
        <div>
          <p class="section-label" id="location-heading">Find a location</p>
          <p class="section-help">Start typing to search. Choose a location from the results.</p>
        </div>
        <div class="search-field-wrap">
          <label class="search-field">
            <span>City or location</span>
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="e.g. Delhi, London, Tokyo"
              role="combobox"
              :aria-expanded="searchResults.length > 0"
              aria-controls="location-results"
              :aria-activedescendant="activeResultIndex >= 0 ? `location-result-${activeResultIndex}` : undefined"
              @input="scheduleLocationSearch"
              @keydown="handleSearchKeydown"
            />
          </label>
          <div v-if="searchLoading" class="search-status" aria-live="polite">Searching…</div>
          <div v-if="searchResults.length" id="location-results" class="search-results" role="listbox" aria-label="Location search results">
            <button
              v-for="(location, index) in searchResults"
              :id="`location-result-${index}`"
              :key="`${location.latitude}-${location.longitude}`"
              class="search-result"
              :class="{ 'search-result--active': index === activeResultIndex }"
              type="button"
              role="option"
              :aria-selected="index === activeResultIndex"
              @mousedown.prevent="selectLocation(location)"
            >
              <strong>{{ location.name }}</strong>
              <span>{{ [location.state, location.country].filter(Boolean).join(', ') }}</span>
            </button>
          </div>
          <p v-if="searchError" class="search-error" role="alert">{{ searchError }}</p>
        </div>
      </section>

      <section class="location-panel" aria-labelledby="coordinates-heading">
        <div>
          <p class="section-label" id="coordinates-heading">Test coordinates</p>
          <p class="section-help">Use coordinates directly while validating the weather API.</p>
        </div>
        <form class="coordinate-form" @submit.prevent="submitCoordinates">
          <label>Latitude <input v-model="latitude" type="number" step="any" min="-90" max="90" inputmode="decimal" /></label>
          <label>Longitude <input v-model="longitude" type="number" step="any" min="-180" max="180" inputmode="decimal" /></label>
          <button class="button button--secondary" type="submit" :disabled="loading">Get weather</button>
        </form>
      </section>

      <section class="weather-card weather-card--stable" aria-live="polite" :aria-busy="loading">
        <template v-if="loading">
          <div class="skeleton-header">
            <div class="skeleton skeleton--eyebrow" />
            <div class="skeleton skeleton--title" />
            <div class="skeleton skeleton--condition" />
          </div>
          <div class="skeleton-temperature"><div class="skeleton skeleton--icon" /><div class="skeleton skeleton--temp" /></div>
          <div class="weather-summary">
            <div v-for="index in 8" :key="index" class="skeleton-tile"><div class="skeleton skeleton--label" /><div class="skeleton skeleton--value" /></div>
          </div>
        </template>
        <template v-else-if="weather">
          <div class="weather-main">
            <div>
              <p class="eyebrow">Current weather</p>
              <h2>{{ weather.location.name }}, {{ weather.location.country }}</h2>
              <p class="condition">{{ weather.description }}</p>
            </div>
            <div class="temperature"><img :src="weatherIconUrl(weather.icon)" :alt="weather.description" /><strong>{{ formatTemperature(weather.temperature) }}</strong></div>
          </div>
          <div class="weather-summary">
            <div><span>Feels like</span><strong>{{ formatTemperature(weather.feelsLike) }}</strong></div>
            <div><span>Humidity</span><strong>{{ weather.humidity }}%</strong></div>
            <div><span>Wind</span><strong>{{ weather.windSpeed }} m/s</strong></div>
            <div><span>Pressure</span><strong>{{ weather.pressure }} hPa</strong></div>
            <div><span>Visibility</span><strong>{{ (weather.visibility / 1000).toFixed(1) }} km</strong></div>
            <div><span>Cloudiness</span><strong>{{ weather.cloudiness }}%</strong></div>
            <div><span>Sunrise</span><strong>{{ weather.sunrise }}</strong></div>
            <div><span>Sunset</span><strong>{{ weather.sunset }}</strong></div>
          </div>
          <p class="weather-meta">Coordinates: {{ weather.location.latitude.toFixed(4) }}, {{ weather.location.longitude.toFixed(4) }}</p>
        </template>
        <div v-else class="weather-empty">
          <p class="eyebrow">Current weather</p>
          <h2>Choose a location to get started</h2>
          <p>Search for a city, use your location, or enter test coordinates.</p>
        </div>
      </section>
      <p v-if="errorMessage" class="state state--error" role="alert">{{ errorMessage }}</p>
    </div>
  </main>
</template>

<style scoped>
.search-field-wrap { position: relative; }
.search-field { display: grid; gap: .4rem; color: #cbd5e1; font-size: .8rem; font-weight: 700; }
.search-field input { width: 100%; min-width: 0; padding: .8rem .9rem; border: 1px solid rgba(255,255,255,.14); border-radius: 10px; background: rgba(0,0,0,.18); color: #f8fafc; font: inherit; }
.search-results { position: absolute; z-index: 20; top: calc(100% + .45rem); right: 0; left: 0; display: grid; gap: .35rem; max-height: 320px; overflow-y: auto; padding: .4rem; border: 1px solid rgba(255,255,255,.12); border-radius: 14px; background: rgba(15,23,42,.98); box-shadow: 0 20px 50px rgba(0,0,0,.4); }
.search-result { display: grid; gap: .2rem; width: 100%; padding: .8rem .9rem; border: 0; border-radius: 10px; background: transparent; color: #f8fafc; text-align: left; cursor: pointer; font: inherit; }
.search-result:hover, .search-result--active { background: rgba(255,255,255,.08); }
.search-result span, .search-status { color: #94a3b8; font-size: .85rem; }
.search-error { margin: .45rem 0 0; color: #fecaca; font-size: .85rem; }
.weather-card--stable { min-height: 430px; position: relative; }
.weather-empty { display: grid; min-height: 390px; place-content: center; text-align: center; }
.weather-empty h2 { margin: 0 0 .5rem; }
.weather-empty p:last-child { margin: 0; color: #94a3b8; }
.skeleton { border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.13), rgba(255,255,255,.06)); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.skeleton-header { position: absolute; top: 2rem; left: 2rem; width: 48%; }
.skeleton--eyebrow { width: 110px; height: 12px; margin-bottom: 1rem; }
.skeleton--title { width: 75%; height: 38px; margin-bottom: .8rem; }
.skeleton--condition { width: 45%; height: 18px; }
.skeleton-temperature { position: absolute; top: 1.6rem; right: 2rem; display: flex; align-items: center; gap: .5rem; }
.skeleton--icon { width: 80px; height: 80px; border-radius: 50%; }
.skeleton--temp { width: 100px; height: 64px; }
.skeleton-tile { padding: 1rem; border-radius: 14px; background: rgba(255,255,255,.04); }
.skeleton--label { width: 60%; height: 12px; margin-bottom: .6rem; }
.skeleton--value { width: 45%; height: 18px; }
@keyframes shimmer { to { background-position: -200% 0; } }
@media (max-width: 640px) {
  .skeleton-header { top: 1.25rem; left: 1.25rem; width: 55%; }
  .skeleton-temperature { top: 1rem; right: 1.25rem; }
  .skeleton--icon { width: 55px; height: 55px; }
  .skeleton--temp { width: 70px; height: 48px; }
}
</style>
