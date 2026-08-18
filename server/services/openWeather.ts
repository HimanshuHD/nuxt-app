import type { CurrentWeather } from '../../shared/types/weather'
import {
  normalizeWeather,
  type OpenWeatherResponse,
} from '../utils/weather'

export interface GeocodingResult {
  name: string
  local_names?: Record<string, string>
  lat: number
  lon: number
  country: string
  state?: string
}

function getBaseUrl(config: ReturnType<typeof useRuntimeConfig>): string {
  return (config.openWeatherBaseUrl || 'https://api.openweathermap.org').replace(
    /\/$/,
    '',
  )
}

function getUpstreamStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const status = 'status' in error ? error.status : undefined
  return typeof status === 'number' ? status : undefined
}

function isFetchError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  return 'request' in error || 'response' in error || 'statusCode' in error
}

function createServiceError(statusCode: number, statusMessage: string) {
  return createError({
    statusCode,
    statusMessage,
  })
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<CurrentWeather> {
  const config = useRuntimeConfig()

  if (!config.openWeatherApiKey) {
    throw createServiceError(
      500,
      'OpenWeatherMap API key is not configured',
    )
  }

  const url = `${getBaseUrl(config)}/data/2.5/weather`

  try {
    const response = await $fetch<OpenWeatherResponse>(url, {
      query: {
        lat: latitude,
        lon: longitude,
        appid: config.openWeatherApiKey,
        units: 'metric',
      },
    })

    return normalizeWeather(response)
  } catch (error: unknown) {
    const statusCode = getUpstreamStatus(error)

    if (statusCode === 401) {
      throw createServiceError(502, 'Weather service authentication failed')
    }

    if (statusCode === 404) {
      throw createServiceError(
        404,
        'Weather data was not found for these coordinates',
      )
    }

    if (statusCode === 429) {
      throw createServiceError(
        503,
        'Weather service rate limit reached. Please try again later.',
      )
    }

    if (isFetchError(error)) {
      throw createServiceError(502, 'Unable to reach the weather service')
    }

    throw error
  }
}

export async function searchLocations(
  query: string,
): Promise<GeocodingResult[]> {
  const config = useRuntimeConfig()

  if (!config.openWeatherApiKey) {
    throw createServiceError(
      500,
      'OpenWeatherMap API key is not configured',
    )
  }

  const url = `${getBaseUrl(config)}/geo/1.0/direct`

  try {
    return await $fetch<GeocodingResult[]>(url, {
      query: {
        q: query,
        limit: 5,
        appid: config.openWeatherApiKey,
      },
    })
  } catch (error: unknown) {
    const statusCode = getUpstreamStatus(error)

    if (statusCode === 401) {
      throw createServiceError(502, 'Weather service authentication failed')
    }

    if (isFetchError(error)) {
      throw createServiceError(502, 'Unable to reach the location service')
    }

    throw error
  }
}
