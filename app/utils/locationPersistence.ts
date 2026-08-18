import type { WeatherLocation } from '../../shared/types/weather'

export const LAST_LOCATION_STORAGE_KEY = 'nuxt-app:last-weather-location'
export type PersistedLocation = Pick<WeatherLocation, 'name' | 'country' | 'state' | 'latitude' | 'longitude'>

export function isPersistedLocation(value: unknown): value is PersistedLocation {
  if (!value || typeof value !== 'object') return false
  const location = value as Record<string, unknown>
  return typeof location.name === 'string' && location.name.trim().length > 0 && typeof location.country === 'string' && location.country.trim().length > 0 && (location.state === undefined || typeof location.state === 'string') && typeof location.latitude === 'number' && Number.isFinite(location.latitude) && location.latitude >= -90 && location.latitude <= 90 && typeof location.longitude === 'number' && Number.isFinite(location.longitude) && location.longitude >= -180 && location.longitude <= 180
}

export function getPersistedLocation(storage: Storage = localStorage): PersistedLocation | null {
  try { const raw = storage.getItem(LAST_LOCATION_STORAGE_KEY); if (!raw) return null; const parsed: unknown = JSON.parse(raw); return isPersistedLocation(parsed) ? parsed : null } catch { return null }
}

export function persistLocation(location: WeatherLocation, storage: Storage = localStorage): void {
  const value: PersistedLocation = { name: location.name, country: location.country, ...(location.state ? { state: location.state } : {}), latitude: location.latitude, longitude: location.longitude }
  try { storage.setItem(LAST_LOCATION_STORAGE_KEY, JSON.stringify(value)) } catch { /* Storage can be unavailable or blocked. */ }
}

export function formatLocationLabel(location: Pick<WeatherLocation, 'name' | 'state' | 'country'>): string { return [location.name, location.state, location.country].filter(Boolean).join(', ') }
