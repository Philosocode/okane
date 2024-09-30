// External
import { format } from 'date-fns'

// Internal
import { createMappers } from '@shared/utils/mappers'

export const mapDate = createMappers({
  /**
   * Convert a Date to datetime-local format (e.g. 2018-06-12T19:30)
   *
   * @param d {Date}
   */
  dateTimeLocal(d: Date) {
    return format(d, `yyyy-MM-dd'T'kk:mm`)
  },
  dateOnlyTimestamp(d: Date) {
    return format(d, 'yyyy-MM-dd')
  },
})

/**
 * Convert a UTC timestamp to a date.
 *
 * @param timestamp
 */
export function mapUTCTimestampToLocalDate(timestamp: string): Date {
  const d = new Date(timestamp)

  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds(),
  )
}
