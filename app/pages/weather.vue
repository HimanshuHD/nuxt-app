<script setup lang="ts">
import type { CurrentWeather } from '~/shared/types/weather'

const weather = ref<CurrentWeather | null>(null)
const loading = ref(false)
const errorMessage = ref('')
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
    const message = getErrorMessage(error)
    errorMessage.value = message
    weather.value = null
  } finally {
    loading.value = false
  }
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
            Check current weather using your location or any latitude and longitude.
          </p>
        </div>

        <button class="button button--primary" type="button" :disabled="loading" @click="useCurrentLocation">
          {{ loading ? 'Loading…' : 'Use my location' }}
        </button>
      </header>

      <section class="location-panel" aria-labelledby="location-heading">
        <div>
          <p class="section-label" id="location-heading">Test coordinates</p>
          <p class="section-help">Useful while validating the weather API before location search is added.</p>
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

      <p v-if="errorMessage" class="state state--error" role="alert">
        {{ errorMessage }}
      </p>

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
          <div>
            <span>Feels like</span>
            <strong>{{ formatTemperature(weather.feelsLike) }}</strong>
          </div>
          <div>
            <span>Humidity</span>
            <strong>{{ weather.humidity }}%</strong>
          </div>
          <div>
            <span>Wind</span>
            <strong>{{ weather.windSpeed }} m/s</strong>
          </div>
          <div>
            <span>Pressure</span>
            <strong>{{ weather.pressure }} hPa</strong>
          </div>
          <div>
            <span>Visibility</span>
            <strong>{{ (weather.visibility / 1000).toFixed(1) }} km</strong>
          </div>
          <div>
            <span>Cloudiness</span>
            <strong>{{ weather.cloudiness }}%</strong>
          </div>
          <div>
            <span>Sunrise</span>
            <strong>{{ weather.sunrise }}</strong>
          </div>
          <div>
            <span>Sunset</span>
            <strong>{{ weather.sunset }}</strong>
          </div>
        </div>

        <p class="weather-meta">
          Coordinates: {{ weather.location.latitude.toFixed(4) }}, {{ weather.location.longitude.toFixed(4) }}
        </p>
      </section>

      <div v-else-if="!loading && !errorMessage" class="state">
        Use your location or enter coordinates above to load current weather.
      </div>
    </div>
  </main>
</template>
