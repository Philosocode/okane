/**
 * Check if a value is a (string) number.
 *
 * @param value
 */
export function isNumeric(value: any): boolean {
  return !isNaN(value) && !isNaN(parseFloat(value))
}
