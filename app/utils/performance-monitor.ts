export interface ApiRequestMetric {
  key: string
  url: string
  count: number
  duplicateCount: number
  lastRequestedAt: number
}

const apiRequests = new Map<string, ApiRequestMetric>()
const DUPLICATE_WINDOW_MS = 2000

function normalizeQuery(query: Record<string, unknown> = {}) {
  return Object.entries(query)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&')
}

export function recordApiRequest(
  url: string,
  query: Record<string, unknown> = {},
) {
  if (!import.meta.client) return

  const queryString = normalizeQuery(query)
  const key = queryString ? `${url}?${queryString}` : url
  const now = performance.now()
  const existing = apiRequests.get(key)

  if (existing) {
    existing.count += 1
    existing.duplicateCount +=
      now - existing.lastRequestedAt <= DUPLICATE_WINDOW_MS ? 1 : 0
    existing.lastRequestedAt = now
    return
  }

  apiRequests.set(key, {
    key,
    url,
    count: 1,
    duplicateCount: 0,
    lastRequestedAt: now,
  })
}

export function getApiRequestMetrics(): ApiRequestMetric[] {
  if (!import.meta.client) return []

  return Array.from(apiRequests.values()).map((request) => ({ ...request }))
}

export function getDuplicateApiRequestCount(): number {
  return getApiRequestMetrics().reduce(
    (total, request) => total + request.duplicateCount,
    0,
  )
}
