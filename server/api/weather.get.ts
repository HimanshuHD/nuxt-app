import { normalizeWeather, parseCoordinate } from '../utils/weather'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lat = parseCoordinate(query.lat, 'lat')
  const lon = parseCoordinate(query.lon, 'lon')
  const config = useRuntimeConfig(event)

  if (!config.openWeatherApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenWeatherMap API key is not configured',
    })
  }

  const baseUrl = config.openWeatherBaseUrl || 'https://api.openweathermap.org'
  const url = `${baseUrl.replace(/\/$/, '')}/data/2.5/weather`

  try {
    const response = await $fetch(url, {
      query: {
        lat,
        lon,
        appid: config.openWeatherApiKey,
        units: 'metric',
      },
    })

    return normalizeWeather(response)
  } catch (error: unknown) {
    const statusCode = getUpstreamStatus(error)

    if (statusCode === 401) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Weather service authentication failed',
      })
    }

    if (statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Weather data was not found for these coordinates',
      })
    }

    if (statusCode === 429) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Weather service rate limit reached. Please try again later.',
      })
    }

    if (isFetchError(error)) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Unable to reach the weather service',
      })
    }

    throw error
  }
})

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

  return 'request' in error || 'response' in error
}
