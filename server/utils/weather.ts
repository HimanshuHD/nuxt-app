import { createError } from 'h3'
import type { CurrentWeather } from '../../shared/types/weather'

export interface OpenWeatherResponse {
  coord: { lon: number; lat: number }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  visibility?: number
  wind?: {
    speed?: number
    deg?: number
  }
  clouds?: {
    all?: number
  }
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  name: string
  timezone: number
}

export function parseCoordinate(value: unknown, name: string): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${name} must be a valid number`,
    })
  }

  const limits: [number, number] = name === 'lat' ? [-90, 90] : [-180, 180]
  if (parsed < limits[0] || parsed > limits[1]) {
    throw createError({
      statusCode: 400,
      statusMessage: `${name} is outside the valid range`,
    })
  }

  return parsed
}

function formatUnixTime(timestamp: number, timezoneOffset: number): string {
  return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(11, 16)
}

export function normalizeWeather(data: OpenWeatherResponse): CurrentWeather {
  const condition = data.weather[0]

  if (!condition) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Weather service returned no weather condition',
    })
  }

  return {
    location: {
      name: data.name,
      country: data.sys.country,
      latitude: data.coord.lat,
      longitude: data.coord.lon,
    },
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    condition: condition.main,
    description: condition.description,
    icon: condition.icon,
    humidity: data.main.humidity,
    windSpeed: data.wind?.speed ?? 0,
    windDirection: data.wind?.deg ?? 0,
    pressure: data.main.pressure,
    visibility: data.visibility ?? 0,
    cloudiness: data.clouds?.all ?? 0,
    sunrise: formatUnixTime(data.sys.sunrise, data.timezone),
    sunset: formatUnixTime(data.sys.sunset, data.timezone),
    timezoneOffset: data.timezone,
  }
}
