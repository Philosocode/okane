// Internal

import type { FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export const queryKeys = {
  all: () => ['all'],
  lists: () => [...queryKeys.all(), 'lists'],
  listByFilters: (filters: FinanceRecordSearchFilters) => [...queryKeys.lists(), 'list', filters],
}

export const financeRecordQueryKeys = queryKeys
