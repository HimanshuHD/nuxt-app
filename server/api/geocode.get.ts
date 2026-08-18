import { searchLocations } from '../services/openWeather'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.q === 'string' ? query.q.trim() : ''

  if (!search) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A location search query is required',
    })
  }

  const locations = await searchLocations(search)

  return locations.map((location) => ({
    name: location.name,
    state: location.state,
    country: location.country,
    latitude: location.lat,
    longitude: location.lon,
  }))
})
