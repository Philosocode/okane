// Internal
import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

export const queryKeys = {
  all: () => ['all'],
  lists: () => [...queryKeys.all(), 'lists'],
  listByFilters: (filters: FinanceRecordsSearchFilters) => [...queryKeys.lists(), filters],
  stats: (filters: FinanceRecordsSearchFilters) => [...queryKeys.all(), 'stats', filters],
}

export const financeRecordQueryKeys = queryKeys
