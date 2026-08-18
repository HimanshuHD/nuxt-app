import type { CurrentWeather } from '../../shared/types/weather'
import type { LocationSearchResult } from '../../shared/types/location'

export async function getCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<CurrentWeather> {
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
  return $fetch<LocationSearchResult[]>('/api/geocode', {
    query: {
      q: query,
    },
  })
}
