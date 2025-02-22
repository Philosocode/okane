// Internal
import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

const queryKeys = {
  all: () => ['financeRecords'],
  lists: () => [...queryKeys.all(), 'lists'],
  listByFilters: (args: { filters: FinanceRecordSearchFilters }) => [
    ...queryKeys.lists(),
    args.filters,
  ],
  stats: (args: { filters: FinanceRecordSearchFilters }) => [
    ...queryKeys.all(),
    'stats',
    args.filters,
  ],
  statsWithTimeInterval: (args: { filters: FinanceRecordSearchFilters; timeInterval: string }) => [
    ...queryKeys.stats(args),
    args.timeInterval,
  ],
}

export const financeRecordQueryKeys = queryKeys
