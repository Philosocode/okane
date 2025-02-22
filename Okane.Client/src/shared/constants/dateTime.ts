// Internal
import { SHARED_COPY } from '@shared/constants/copy'

import { type SelectOption } from '@shared/components/form/FormSelect.vue'

export const COMMON_DATE_FORMAT = 'MMM d yyyy'
export const COMMON_TIME_FORMAT = 'k:mm a'
export const COMMON_DATE_TIME_FORMAT = `${COMMON_DATE_FORMAT} @ ${COMMON_TIME_FORMAT}`

export enum TIME_INTERVAL {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export const TIME_INTERVAL_OPTIONS: SelectOption[] = [
  {
    label: SHARED_COPY.TIME_INTERVAL.DAY,
    value: TIME_INTERVAL.DAY,
  },
  {
    label: SHARED_COPY.TIME_INTERVAL.WEEK,
    value: TIME_INTERVAL.WEEK,
  },
  {
    label: SHARED_COPY.TIME_INTERVAL.MONTH,
    value: TIME_INTERVAL.MONTH,
  },
  {
    label: SHARED_COPY.TIME_INTERVAL.YEAR,
    value: TIME_INTERVAL.YEAR,
  },
]
