import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

function createTestError(statusCode: number, statusMessage: string) {
  return Object.assign(new Error(statusMessage), { statusCode, statusMessage })
}

const query = { lat: '28.6139', lon: '77.2090' }
const config = {
  openWeatherApiKey: 'test-key',
  openWeatherBaseUrl: 'https://api.example.test',
}
const fetchMock = vi.fn()

vi.stubGlobal('createError', createTestError)
vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
vi.stubGlobal('getQuery', () => query)
vi.stubGlobal('useRuntimeConfig', () => config)
vi.stubGlobal('$fetch', fetchMock)

type WeatherHandler = (event: unknown) => Promise<unknown>
let weatherHandler: WeatherHandler

beforeAll(async () => {
  weatherHandler = await import('../api/weather.get').then((module) => module.default as WeatherHandler)
})

describe('weather utilities', () => {
  it('accepts valid latitude and longitude values', async () => {
    const { parseCoordinate } = await import('./weather')

    expect(parseCoordinate('28.6139', 'lat')).toBe(28.6139)
    expect(parseCoordinate('77.2090', 'lon')).toBe(77.209)
  })

  it('rejects non-numeric coordinates', async () => {
    const { parseCoordinate } = await import('./weather')

    expect(() => parseCoordinate('abc', 'lat')).toThrow('lat must be a valid number')
  })

  it('rejects coordinates outside their valid ranges', async () => {
    const { parseCoordinate } = await import('./weather')

    expect(() => parseCoordinate(91, 'lat')).toThrow('lat is outside the valid range')
    expect(() => parseCoordinate(-181, 'lon')).toThrow('lon is outside the valid range')
  })

  it('normalizes the OpenWeather response into the frontend contract', async () => {
    const { normalizeWeather } = await import('./weather')
    const result = normalizeWeather({
      coord: { lon: 77.209, lat: 28.6139 },
      weather: [{ main: 'Clouds', description: 'broken clouds', icon: '04d' }],
      main: { temp: 29.4, feels_like: 31.2, humidity: 62, pressure: 1008 },
      visibility: 10000,
      wind: { speed: 3.2, deg: 180 },
      clouds: { all: 75 },
      sys: { country: 'IN', sunrise: 1755210600, sunset: 1755257400 },
      name: 'Delhi',
      timezone: 19800,
    })

    expect(result).toMatchObject({
      location: { name: 'Delhi', country: 'IN', latitude: 28.6139, longitude: 77.209 },
      temperature: 29.4,
      feelsLike: 31.2,
      condition: 'Clouds',
      description: 'broken clouds',
      humidity: 62,
      windSpeed: 3.2,
      windDirection: 180,
      pressure: 1008,
      visibility: 10000,
      cloudiness: 75,
      timezoneOffset: 19800,
    })
  })

  it('rejects an upstream response without a weather condition', async () => {
    const { normalizeWeather } = await import('./weather')

    expect(() => normalizeWeather({
      coord: { lon: 77.209, lat: 28.6139 },
      weather: [],
      main: { temp: 29.4, feels_like: 31.2, humidity: 62, pressure: 1008 },
      sys: { country: 'IN', sunrise: 1755210600, sunset: 1755257400 },
      name: 'Delhi',
      timezone: 19800,
    })).toThrow('Weather service returned no weather condition')
  })
})

describe('weather API handler', () => {
  beforeEach(() => {
    query.lat = '28.6139'
    query.lon = '77.2090'
    config.openWeatherApiKey = 'test-key'
    config.openWeatherBaseUrl = 'https://api.example.test'
    fetchMock.mockReset()
  })

  it('returns normalized weather data for valid coordinates', async () => {
    fetchMock.mockResolvedValue({
      coord: { lon: 77.209, lat: 28.6139 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: { temp: 30, feels_like: 32, humidity: 50, pressure: 1010 },
      sys: { country: 'IN', sunrise: 1755210600, sunset: 1755257400 },
      name: 'Delhi',
      timezone: 19800,
    })

    const result = await weatherHandler({})

    expect(result).toMatchObject({ location: { name: 'Delhi', country: 'IN' }, temperature: 30 })
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/data/2.5/weather', {
      query: { lat: 28.6139, lon: 77.209, appid: 'test-key', units: 'metric' },
    })
  })

  it('rejects invalid latitude before calling OpenWeatherMap', async () => {
    query.lat = '100'

    await expect(weatherHandler({})).rejects.toMatchObject({ statusCode: 400 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns a useful error when the API key is missing', async () => {
    config.openWeatherApiKey = ''

    await expect(weatherHandler({})).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'OpenWeatherMap API key is not configured',
    })
  })

  it.each([
    [401, 502, 'Weather service authentication failed'],
    [404, 404, 'Weather data was not found for these coordinates'],
    [429, 503, 'Weather service rate limit reached. Please try again later.'],
  ])('maps upstream status %s to a safe client error', async (upstreamStatus, clientStatus, message) => {
    fetchMock.mockRejectedValue({ status: upstreamStatus, response: {} })

    await expect(weatherHandler({})).rejects.toMatchObject({ statusCode: clientStatus, statusMessage: message })
  })

  it('returns a service-unavailable error when OpenWeatherMap cannot be reached', async () => {
    fetchMock.mockRejectedValue({ request: {}, message: 'network failure' })

    await expect(weatherHandler({})).rejects.toMatchObject({
      statusCode: 502,
      statusMessage: 'Unable to reach the weather service',
    })
  })

  it('preserves a normalized upstream response error', async () => {
    fetchMock.mockResolvedValue({
      coord: { lon: 77.209, lat: 28.6139 },
      weather: [],
      main: { temp: 30, feels_like: 32, humidity: 50, pressure: 1010 },
      sys: { country: 'IN', sunrise: 1755210600, sunset: 1755257400 },
      name: 'Delhi',
      timezone: 19800,
    })

    await expect(weatherHandler({})).rejects.toMatchObject({
      statusCode: 502,
      statusMessage: 'Weather service returned no weather condition',
    })
  })
})
