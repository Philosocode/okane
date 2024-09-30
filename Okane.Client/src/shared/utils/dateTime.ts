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
    return format(d, "yyyy-MM-dd'T'kk:mm")
  },
})
