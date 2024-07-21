/**
 * Check if the given value is an object.
 *
 * @param value
 */
export function isObjectType(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object') return false
  if (value instanceof Date) return false
  if (Array.isArray(value)) return false
  if (value === null) return false

  return true
}

/**
 * Check if an object has a particular key.
 *
 * @param obj
 * @param key
 */
export function objectHasKey<T>(obj: T, key: PropertyKey): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * Create a shallow clone of an object without certain keys.
 *
 * @param original
 * @param omitKeys
 */
export function omitObjectKeys<T, K extends keyof T>(
  original: T,
  omitKeys: K[],
): Pick<T, Exclude<keyof T, K>> {
  const clone = { ...original }

  omitKeys.forEach((key) => {
    delete clone[key]
  })

  return clone
}
