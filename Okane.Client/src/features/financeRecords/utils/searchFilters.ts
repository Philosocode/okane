// Internal
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import {
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
