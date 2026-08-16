interface GeocodingResult {
  name: string
  local_names?: Record<string, string>
  lat: number
  lon: number
  country: string
  state?: string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.q === 'string' ? query.q.trim() : ''
  const config = useRuntimeConfig(event)

  if (!search) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A location search query is required',
    })
  }

  if (!config.openWeatherApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenWeatherMap API key is not configured',
    })
  }

  const baseUrl = config.openWeatherBaseUrl || 'https://api.openweathermap.org'
  const url = `${baseUrl.replace(/\/$/, '')}/geo/1.0/direct`

  try {
    const response = await $fetch<GeocodingResult[]>(url, {
      query: {
        q: search,
        limit: 5,
        appid: config.openWeatherApiKey,
      },
    })

    return response.map((location) => ({
      name: location.name,
      state: location.state,
      country: location.country,
      latitude: location.lat,
      longitude: location.lon,
    }))
  } catch (error: unknown) {
    const status = getUpstreamStatus(error)

    if (status === 401) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Weather service authentication failed',
      })
    }

    if (isFetchError(error)) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Unable to reach the location service',
      })
    }

    throw error
  }
})

function getUpstreamStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined
  const status = 'status' in error ? error.status : undefined
  return typeof status === 'number' ? status : undefined
}

function isFetchError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  return 'request' in error || 'response' in error || 'statusCode' in error
}
