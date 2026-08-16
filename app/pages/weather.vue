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

async function fetchWeather(lat = Number(latitude.value), lon = Number(longitude.value)) {
  errorMessage.value = ''
  loading.value = true

  try {
    weather.value = await $fetch<CurrentWeather>('/api/weather', {
      query: { lat, lon },
    })
  } catch (error: unknown) {
    weather.value = null
    errorMessage.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

async function searchLocations() {
  const query = searchQuery.value.trim()
  searchError.value = ''
  searchResults.value = []

  if (query.length < 2) {
    searchError.value = 'Enter at least 2 characters to search for a location.'
    return
  }

  searchLoading.value = true

  try {
    searchResults.value = await $fetch<LocationResult[]>('/api/geocode', {
      query: { q: query },
    })

    if (searchResults.value.length === 0) {
      searchError.value = 'No matching locations found. Try a city or country name.'
    }
  } catch (error: unknown) {
    searchError.value = getErrorMessage(error)
  } finally {
    searchLoading.value = false
  }
}

function selectLocation(location: LocationResult) {
  latitude.value = location.latitude.toFixed(4)
  longitude.value = location.longitude.toFixed(4)
  searchQuery.value = [location.name, location.state, location.country].filter(Boolean).join(', ')
  searchResults.value = []
  searchError.value = ''
  void fetchWeather(location.latitude, location.longitude)
}

function useCurrentLocation() {
  errorMessage.value = ''

  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported by this browser.'
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
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  )
}

function submitCoordinates() {
  const lat = Number(latitude.value)
  const lon = Number(longitude.value)

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    errorMessage.value = 'Latitude must be a number between -90 and 90.'
    return
  }

  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    errorMessage.value = 'Longitude must be a number between -180 and 180.'
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
          <p class="intro">
            Check current weather using your location, a city search, or coordinates.
          </p>
        </div>

        <button class="button button--primary" type="button" :disabled="loading" @click="useCurrentLocation">
          {{ loading ? 'Loading…' : 'Use my location' }}
        </button>
      </header>

      <section class="location-panel" aria-labelledby="location-heading">
        <div>
          <p class="section-label" id="location-heading">Find a location</p>
          <p class="section-help">Search for a city and choose the matching location.</p>
        </div>

        <form class="search-form" role="search" @submit.prevent="searchLocations">
          <label class="search-field">
            <span>City or location</span>
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="e.g. Delhi, London, Tokyo"
              aria-describedby="search-help"
            />
          </label>
          <button class="button button--secondary" type="submit" :disabled="searchLoading">
            {{ searchLoading ? 'Searching…' : 'Search' }}
          </button>
        </form>
        <p id="search-help" class="section-help">Search results are provided by OpenWeatherMap geocoding.</p>

        <div v-if="searchResults.length" class="search-results" role="listbox" aria-label="Location search results">
          <button
            v-for="location in searchResults"
            :key="`${location.latitude}-${location.longitude}`"
            class="search-result"
            type="button"
            role="option"
            @click="selectLocation(location)"
          >
            <strong>{{ location.name }}</strong>
            <span>{{ [location.state, location.country].filter(Boolean).join(', ') }}</span>
          </button>
        </div>

        <p v-if="searchError" class="state state--error" role="alert">{{ searchError }}</p>
      </section>

      <section class="location-panel" aria-labelledby="coordinates-heading">
        <div>
          <p class="section-label" id="coordinates-heading">Test coordinates</p>
          <p class="section-help">Use coordinates directly while validating the weather API.</p>
        </div>

        <form class="coordinate-form" @submit.prevent="submitCoordinates">
          <label>
            Latitude
            <input v-model="latitude" type="number" step="any" min="-90" max="90" inputmode="decimal" />
          </label>
          <label>
            Longitude
            <input v-model="longitude" type="number" step="any" min="-180" max="180" inputmode="decimal" />
          </label>
          <button class="button button--secondary" type="submit" :disabled="loading">
            Get weather
          </button>
        </form>
      </section>

      <p v-if="errorMessage" class="state state--error" role="alert">{{ errorMessage }}</p>

      <section v-if="weather" class="weather-card" aria-live="polite">
        <div class="weather-main">
          <div>
            <p class="eyebrow">Current weather</p>
            <h2>{{ weather.location.name }}, {{ weather.location.country }}</h2>
            <p class="condition">{{ weather.description }}</p>
          </div>

          <div class="temperature">
            <img :src="weatherIconUrl(weather.icon)" :alt="weather.description" />
            <strong>{{ formatTemperature(weather.temperature) }}</strong>
          </div>
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

        <p class="weather-meta">
          Coordinates: {{ weather.location.latitude.toFixed(4) }}, {{ weather.location.longitude.toFixed(4) }}
        </p>
      </section>

      <div v-else-if="!loading && !errorMessage" class="state">
        Search for a location, use your location, or enter coordinates above to load current weather.
      </div>
    </div>
  </main>
</template>
