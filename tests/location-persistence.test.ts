import { describe, expect, it } from 'vitest'
import { LAST_LOCATION_STORAGE_KEY, getPersistedLocation, isPersistedLocation, persistLocation } from '../app/utils/locationPersistence'

function createStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
    removeItem: (key: string) => { data.delete(key) },
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() { return data.size },
  } as Storage
}

describe('location persistence', () => {
  it('accepts valid persisted locations', () => expect(isPersistedLocation({ name: 'Delhi', country: 'IN', latitude: 28.6139, longitude: 77.209 })).toBe(true))
  it('rejects invalid coordinates and missing labels', () => {
    expect(isPersistedLocation({ name: '', country: 'IN', latitude: 28, longitude: 77 })).toBe(false)
    expect(isPersistedLocation({ name: 'Delhi', country: 'IN', latitude: 91, longitude: 77 })).toBe(false)
    expect(isPersistedLocation({ name: 'Delhi', country: 'IN', latitude: 28, longitude: -181 })).toBe(false)
  })
  it('restores valid JSON and ignores malformed data', () => {
    const valid = createStorage({ [LAST_LOCATION_STORAGE_KEY]: JSON.stringify({ name: 'Delhi', country: 'IN', latitude: 28.6139, longitude: 77.209 }) })
    expect(getPersistedLocation(valid)?.name).toBe('Delhi')
    expect(getPersistedLocation(createStorage({ [LAST_LOCATION_STORAGE_KEY]: '{bad json' }))).toBeNull()
  })
  it('persists only the location fields required for restore', () => {
    const storage = createStorage()
    persistLocation({ name: 'Delhi', state: 'Delhi', country: 'IN', latitude: 28.6139, longitude: 77.209 }, storage)
    expect(getPersistedLocation(storage)).toEqual({ name: 'Delhi', state: 'Delhi', country: 'IN', latitude: 28.6139, longitude: 77.209 })
  })
})
