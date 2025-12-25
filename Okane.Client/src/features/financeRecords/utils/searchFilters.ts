// External
import { startOfMonth, startOfYear, subDays } from 'date-fns'

// Internal
import {
  FINANCE_RECORD_SORT_FIELD_OPTIONS,
  HAPPENED_AT_TIMEFRAME_OPTIONS,
} from '@features/financeRecords/constants/searchFilters'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import {
  HAPPENED_AT_TIMEFRAME,
  type FinanceRecordSearchCursor,
  type FinanceRecordSearchFilters,
} from '@features/financeRecords/types/searchFilters'

export function getFinanceRecordsSearchCursor(
  searchFilters: FinanceRecordSearchFilters,
  lastFinanceRecord?: FinanceRecord,
): FinanceRecordSearchCursor {
  if (!lastFinanceRecord) return {}

  const cursor: FinanceRecordSearchCursor = { id: lastFinanceRecord?.id }

  if (searchFilters.sortField === 'amount') {
    cursor.amount = lastFinanceRecord.amount
  } else {
    cursor.happenedAt = lastFinanceRecord.happenedAt
  }

  return cursor
}

/**
 * Given a happenedAtTimeframe, return a start date. Returns nothing if the timeframe is "custom".
 *
 * @param timeframe
 */
export function getHappenedAtTimeframeStartDate(timeframe: HAPPENED_AT_TIMEFRAME) {
  const now = Date.now()
  let startDate: Date | undefined
  if (timeframe === HAPPENED_AT_TIMEFRAME.PAST_30_DAYS) {
    startDate = subDays(now, 30)
  } else if (timeframe === HAPPENED_AT_TIMEFRAME.THIS_MONTH) {
    startDate = startOfMonth(now)
  } else if (timeframe === HAPPENED_AT_TIMEFRAME.THIS_YEAR) {
    startDate = startOfYear(now)
  }

  return startDate
}

export function isFinanceRecordSortField(
  value: unknown,
): value is FinanceRecordSearchFilters['sortField'] {
  return FINANCE_RECORD_SORT_FIELD_OPTIONS.some((option) => option.value === value)
}

export function isHappenedAtTimeframe(value: unknown): value is HAPPENED_AT_TIMEFRAME {
  return HAPPENED_AT_TIMEFRAME_OPTIONS.some((option) => option.value === value)
}
