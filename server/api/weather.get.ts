import { fetchCurrentWeather } from '../services/openWeather'
import { parseCoordinate } from '../utils/weather'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const latitude = parseCoordinate(query.lat, 'lat')
  const longitude = parseCoordinate(query.lon, 'lon')

  return fetchCurrentWeather(latitude, longitude)
})
