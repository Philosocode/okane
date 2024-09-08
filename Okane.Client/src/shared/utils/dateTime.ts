// External
import { format } from 'date-fns'

/**
 * Convert a Date to datetime-local format (e.g. 2018-06-12T19:30)
 *
 * @param d {Date}
 */
// 2022-02-17T13:18:30
export function dateToDateTimeLocalFormat(d: Date) {
  return format(d, "yyyy-MM-dd'T'kk:mm")
}
