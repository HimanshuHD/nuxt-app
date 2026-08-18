import type { WeatherLocation } from '../../shared/types/weather'
import { formatLocationLabel, getPersistedLocation, persistLocation, type PersistedLocation } from '~/utils/locationPersistence'

export function useLastLocation() {
  const location = ref<PersistedLocation | null>(null)
  function restore() { if (!import.meta.client) return null; location.value = getPersistedLocation(); return location.value }
  function save(weatherLocation: WeatherLocation) { if (!import.meta.client) return; persistLocation(weatherLocation); location.value = { name: weatherLocation.name, country: weatherLocation.country, ...(weatherLocation.state ? { state: weatherLocation.state } : {}), latitude: weatherLocation.latitude, longitude: weatherLocation.longitude } }
  return { location: readonly(location), restore, save, formatLabel: formatLocationLabel }
}
