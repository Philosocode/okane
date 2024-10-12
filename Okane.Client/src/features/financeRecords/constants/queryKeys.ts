// Internal
import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

export const queryKeys = {
  all: () => ['all'],
  lists: () => [...queryKeys.all(), 'lists'],
  listByFilters: (args: { filters: FinanceRecordsSearchFilters }) => [...queryKeys.lists(), args.filters],
  stats: (args: { filters: FinanceRecordsSearchFilters }) => [...queryKeys.all(), 'stats', args.filters],
}

export const financeRecordQueryKeys = queryKeys
