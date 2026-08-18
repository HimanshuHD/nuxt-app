import { createError } from 'h3'

export function parseCoordinate(value: unknown, name: string): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${name} must be a valid number`,
    })
  }

  const limits: [number, number] = name === 'lat' ? [-90, 90] : [-180, 180]

  if (parsed < limits[0] || parsed > limits[1]) {
    throw createError({
      statusCode: 400,
      statusMessage: `${name} is outside the valid range`,
    })
  }

  return parsed
}
