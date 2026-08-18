<script setup lang="ts">
import type { CurrentWeather } from '../../../shared/types/weather'
import WeatherVisual from './WeatherVisual.vue'

const props = defineProps<{ weather: CurrentWeather | null; loading?: boolean }>()

function weatherIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

function countryFlagUrl(country: string) {
  return `https://flagcdn.com/w80/${country.toLowerCase()}.png`
}

function formatTemperature(value: number) {
  return `${Math.round(value)}°`
}
</script>
<template>
  <section
    class="weather-card weather-card--stable"
    aria-live="polite"
    :aria-busy="props.loading"
  >
    <!-- Loading state -->
    <template v-if="props.loading">
      <div class="skeleton-header">
        <div class="skeleton skeleton--eyebrow" />
        <div class="skeleton skeleton--title" />
        <div class="skeleton skeleton--condition" />
      </div>
      <div class="skeleton-temperature">
        <div class="skeleton skeleton--icon" />
        <div class="skeleton skeleton--temp" />
      </div>
      <div class="weather-summary">
        <div v-for="index in 8" :key="index" class="skeleton-tile">
          <div class="skeleton skeleton--label" />
          <div class="skeleton skeleton--value" />
        </div>
      </div>
    </template>

    <!-- Weather loaded state -->
    <template v-else-if="props.weather">
      <div class="weather-main">
        <div class="weather-location">
          <p class="eyebrow">Current weather</p>
          <div class="location-title">
            <img
              class="country-flag"
              :src="countryFlagUrl(props.weather.location.country)"
              :alt="`${props.weather.location.country} flag`"
              width="40"
              height="27"
              loading="lazy"
            >
            <h2>{{ props.weather.location.name }}, {{ props.weather.location.country }}</h2>
          </div>
          <p class="condition">{{ props.weather.description }}</p>
        </div>
        <div class="weather-visual-wrap">
          <WeatherVisual
            :condition="props.weather.description"
            :icon="props.weather.icon"
          />
          <div class="temperature">
            <img
              :src="weatherIconUrl(props.weather.icon)"
              :alt="props.weather.description"
            >
            <strong>{{ formatTemperature(props.weather.temperature) }}</strong>
          </div>
        </div>
      </div>
      <div class="weather-summary">
        <div>
          <span>Feels like</span>
          <strong>{{ formatTemperature(props.weather.feelsLike) }}</strong>
        </div>
        <div>
          <span>Humidity</span>
          <strong>{{ props.weather.humidity }}%</strong>
        </div>
        <div>
          <span>Wind</span>
          <strong>{{ props.weather.windSpeed }} m/s</strong>
        </div>
        <div>
          <span>Pressure</span>
          <strong>{{ props.weather.pressure }} hPa</strong>
        </div>
        <div>
          <span>Visibility</span>
          <strong>{{ (props.weather.visibility / 1000).toFixed(1) }} km</strong>
        </div>
        <div>
          <span>Cloudiness</span>
          <strong>{{ props.weather.cloudiness }}%</strong>
        </div>
        <div>
          <span>Sunrise</span>
          <strong>{{ props.weather.sunrise }}</strong>
        </div>
        <div>
          <span>Sunset</span>
          <strong>{{ props.weather.sunset }}</strong>
        </div>
      </div>
      <p class="weather-meta">
        Coordinates: {{ props.weather.location.latitude.toFixed(4) }},
        {{ props.weather.location.longitude.toFixed(4) }}
      </p>
    </template>

    <!-- Empty state -->
    <div v-else class="weather-empty">
      <p class="eyebrow">Current weather</p>
      <h2>Choose a location to get started</h2>
      <p>Search for a city, use your location, or enter coordinates.</p>
    </div>
  </section>
</template>
<style scoped>
.weather-card--stable {
  min-height: 430px;
  position: relative;
  z-index: 1;
}

.weather-location {
  min-width: 0;
}

.location-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.location-title h2 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.75rem);
}

.country-flag {
  width: 40px;
  height: 27px;
  flex: 0 0 auto;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.weather-visual-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.weather-visual-wrap .temperature {
  margin-top: 0.5rem;
}

.weather-empty {
  display: grid;
  min-height: 390px;
  place-content: center;
  text-align: center;
}

.weather-empty h2 {
  margin: 0 0 0.5rem;
}

.weather-empty p:last-child {
  margin: 0;
  color: #94a3b8;
}

.skeleton {
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.13),
    rgba(255, 255, 255, 0.06)
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-header {
  position: absolute;
  top: 2rem;
  left: 2rem;
  width: 48%;
}

.skeleton--eyebrow {
  width: 110px;
  height: 12px;
  margin-bottom: 1rem;
}

.skeleton--title {
  width: 75%;
  height: 38px;
  margin-bottom: 0.8rem;
}

.skeleton--condition {
  width: 45%;
  height: 18px;
}

.skeleton-temperature {
  position: absolute;
  top: 1.6rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skeleton--icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.skeleton--temp {
  width: 100px;
  height: 64px;
}

.skeleton-tile {
  padding: 1rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.skeleton--label {
  width: 60%;
  height: 12px;
  margin-bottom: 0.6rem;
}

.skeleton--value {
  width: 70%;
  height: 18px;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
