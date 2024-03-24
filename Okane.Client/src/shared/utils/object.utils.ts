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
