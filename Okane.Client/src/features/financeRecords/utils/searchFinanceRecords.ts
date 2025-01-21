// Internal
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import {
  type FinanceRecordsSearchCursor,
  type FinanceRecordsSearchFilters,
} from '@features/financeRecords/types/searchFinanceRecords'

export function getFinanceRecordsSearchCursor(
  searchFilters: FinanceRecordsSearchFilters,
  lastFinanceRecord?: FinanceRecord,
): FinanceRecordsSearchCursor {
  if (!lastFinanceRecord) return {}

  const cursor: FinanceRecordsSearchCursor = { id: lastFinanceRecord?.id }

  if (searchFilters.sortField === 'amount') {
    cursor.amount = lastFinanceRecord.amount
  } else {
    cursor.happenedAt = lastFinanceRecord.happenedAt
  }

  return cursor
}
