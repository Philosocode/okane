/**
 * Check if a value is a (string) number.
 *
 * @param value
 */
export function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') return true
  if (typeof value === 'string') return !isNaN(value as any) && !isNaN(parseFloat(value))

  return false
}
