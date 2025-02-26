// External
import { format, parse } from 'date-fns'

// Internal
import { createMappers } from '@shared/utils/mappers'

const dateOnlyTimestampFormat = 'yyyy-MM-dd'

export const mapDate = createMappers({
  /**
   * Convert a Date to datetime-local format (e.g. 2018-06-12T19:30)
   *
   * @param d {Date}
   */
  dateTimeLocal(d: Date) {
    return format(d, `yyyy-MM-dd'T'HH:mm`)
  },
  dateOnlyTimestamp(d: Date) {
    return format(d, dateOnlyTimestampFormat)
  },
})

/**
 * Parse a timestamp of format YYYY-MM-DD (returned by input type="date").
 * Return a new Date set to midnight for the current time zone.
 */
export function mapDateOnlyTimestampToLocalizedDate(dateString: string): Date {
  return parse(dateString, dateOnlyTimestampFormat, new Date())
}

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
