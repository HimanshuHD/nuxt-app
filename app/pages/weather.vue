<script setup lang="ts">
import type { CurrentWeather } from '../../shared/types/weather'
import type { LocationSearchResult } from '~/components/weather/LocationSearch.vue'
import CoordinateSearch from '~/components/weather/CoordinateSearch.vue'
import LocationSearch from '~/components/weather/LocationSearch.vue'
import WeatherCard from '~/components/weather/WeatherCard.vue'

const weather = ref<CurrentWeather | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const latitude = ref('28.6139')
const longitude = ref('77.2090')
const hasRestoredLocation = ref(false)

const toast = useToast()
const lastLocation = useLastLocation()
const locationSearch = useLocationSearch()
const { searchQuery, searchResults, searchLoading, searchError } = locationSearch

async function fetchWeather(
  lat = Number(latitude.value),
  lon = Number(longitude.value),
) {
  errorMessage.value = ''
  loading.value = true

  try {
    const result = await $fetch<CurrentWeather>('/api/weather', {
      query: { lat, lon },
    })

    weather.value = result
    latitude.value = result.location.latitude.toFixed(4)
    longitude.value = result.location.longitude.toFixed(4)
    locationSearch.setQuery(lastLocation.formatLabel(result.location))
    lastLocation.save(result.location)
    toast.success('Weather data updated successfully.')
  } catch (error: unknown) {
    errorMessage.value = getWeatherErrorMessage(error)
    toast.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

function selectLocation(location: LocationSearchResult) {
  latitude.value = location.latitude.toFixed(4)
  longitude.value = location.longitude.toFixed(4)
  locationSearch.setQueryFromLocation(location)
  locationSearch.clearResults()
  void fetchWeather(location.latitude, location.longitude)
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
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
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

function retryWeather() {
  void fetchWeather()
}

function getWeatherErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    if ('statusMessage' in error && typeof error.statusMessage === 'string') {
      return error.statusMessage
    }

    if (
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'statusMessage' in error.data &&
      typeof error.data.statusMessage === 'string'
    ) {
      return error.data.statusMessage
    }
  }

  return 'Unable to load weather data. Please try again.'
}

function getGeolocationError(code: number) {
  if (code === 1) {
    return 'Location permission was denied. You can enter coordinates manually.'
  }

  if (code === 2) {
    return 'Your location could not be determined. Try again or enter coordinates manually.'
  }

  if (code === 3) {
    return 'Location request timed out. Try again or enter coordinates manually.'
  }

  return 'Unable to determine your location.'
}

onMounted(() => {
  const saved = lastLocation.restore()

  if (!saved) return

  hasRestoredLocation.value = true
  latitude.value = saved.latitude.toFixed(4)
  longitude.value = saved.longitude.toFixed(4)
  locationSearch.setQuery(lastLocation.formatLabel(saved))
  void fetchWeather(saved.latitude, saved.longitude)
})
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

        <button
          id="use-location"
          class="button button--primary"
          type="button"
          :disabled="loading"
          aria-describedby="location-help"
          @click="useCurrentLocation"
        >
          {{ loading ? 'Loading…' : 'Use my location' }}
        </button>
      </header>

      <section
        class="location-panel"
        aria-labelledby="location-heading"
        aria-describedby="location-help"
      >
        <div>
          <p id="location-heading" class="section-label">Find a location</p>
          <p id="location-help" class="section-help">
            Start typing to search. Choose a location from the results, use your current location, or enter coordinates in Advanced Search.
          </p>
        </div>

        <LocationSearch
          v-model="searchQuery"
          :results="searchResults"
          :loading="searchLoading"
          :error="searchError"
          @search="locationSearch.search"
          @select="selectLocation"
          @clear="locationSearch.clear"
          @close="locationSearch.clearResults"
        />
      </section>

      <CoordinateSearch
        :latitude="latitude"
        :longitude="longitude"
        :loading="loading"
        @update:latitude="latitude = $event"
        @update:longitude="longitude = $event"
        @submit="submitCoordinates"
      />

      <WeatherCard :weather="weather" :loading="loading" />

      <div
        v-if="errorMessage"
        class="state state--error weather-error"
        role="alert"
        aria-live="assertive"
      >
        <p>{{ errorMessage }}</p>
        <button
          class="button button--secondary"
          type="button"
          :disabled="loading"
          @click="retryWeather"
        >
          Try again
        </button>
      </div>

      <p
        v-if="hasRestoredLocation && !loading && !errorMessage"
        class="weather-meta weather-restore-note"
      >
        Showing your last selected location.
      </p>
    </div>
  </main>
</template>

<style scoped>
.location-panel {
  position: relative;
  z-index: 30;
}

.weather-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  text-align: center;
}

.weather-error p {
  margin: 0;
}

.weather-restore-note {
  text-align: center;
}
</style>
