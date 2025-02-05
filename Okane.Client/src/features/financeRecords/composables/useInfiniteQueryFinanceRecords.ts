// External
import { computed, inject } from 'vue'

import { type QueryFunctionContext, useInfiniteQuery } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type ApiPaginatedResponse } from '@shared/services/apiClient/types'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import {
  type FinanceRecordsSearchCursor,
  type FinanceRecordsSearchFilters,
} from '@features/financeRecords/types/searchFinanceRecords'

import { useCleanUpInfiniteQuery } from '@shared/composables/useCleanUpInfiniteQuery'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { getFinanceRecordsSearchCursor } from '@features/financeRecords/utils/searchFinanceRecords'

export function fetchPaginatedFinanceRecords({
  pageParam,
  queryKey,
  signal,
}: QueryFunctionContext): Promise<ApiPaginatedResponse<FinanceRecord>> {
  const searchFilters = queryKey[queryKey.length - 1] as FinanceRecordsSearchFilters
  const cursor = pageParam as FinanceRecordsSearchCursor
  const url = financeRecordAPIRoutes.getPaginatedList({ cursor, searchFilters })

  return apiClient.get(url, { signal })
}

export function useInfiniteQueryFinanceRecords() {
  const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
  const queryKey = computed(() =>
    financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters }),
  )

  useCleanUpInfiniteQuery(queryKey)

  return useInfiniteQuery({
    queryKey,
    queryFn: fetchPaginatedFinanceRecords,
    initialPageParam: {} as FinanceRecordsSearchCursor,
    getNextPageParam: (lastPage, _) => {
      if (!lastPage.hasNextPage) return null
      return getFinanceRecordsSearchCursor(searchProvider.filters, lastPage.items[0])
    },
  })
}
