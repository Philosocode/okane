// Internal

import type { FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

const queryKeys = {
  ALL: () => ['all'],
  LISTS: () => [...queryKeys.ALL(), 'lists'],
  LIST_BY_FILTERS: (filters: FinanceRecordSearchFilters) => [...queryKeys.LISTS(), 'list', filters],
}

export const FINANCE_RECORD_QUERY_KEYS = queryKeys
