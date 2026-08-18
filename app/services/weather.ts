import type { CurrentWeather } from '../../shared/types/weather'
import type { LocationSearchResult } from '../../shared/types/location'
import { recordApiRequest } from '~/utils/performance-monitor'

export async function getCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<CurrentWeather> {
  recordApiRequest('/api/weather', {
    lat: latitude,
    lon: longitude,
  })

  return $fetch<CurrentWeather>('/api/weather', {
    query: {
      lat: latitude,
      lon: longitude,
    },
  })
}

export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  recordApiRequest('/api/geocode', { q: query })

  return $fetch<LocationSearchResult[]>('/api/geocode', {
    query: {
      q: query,
    },
  })
}
