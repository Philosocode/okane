// External
import { computed, inject } from 'vue'

import { type QueryFunctionContext, useInfiniteQuery } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type ApiPaginatedResponse } from '@shared/services/apiClient/types'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import {
  type FinanceRecordSearchCursor,
  type FinanceRecordSearchFilters,
} from '@features/financeRecords/types/searchFilters'

import { useCleanUpInfiniteQuery } from '@shared/composables/useCleanUpInfiniteQuery'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { getFinanceRecordsSearchCursor } from '@features/financeRecords/utils/searchFilters'

export function fetchPaginatedFinanceRecords({
  pageParam,
  queryKey,
  signal,
}: QueryFunctionContext): Promise<ApiPaginatedResponse<FinanceRecord>> {
  const searchFilters = queryKey[queryKey.length - 1] as FinanceRecordSearchFilters
  const cursor = pageParam as FinanceRecordSearchCursor
  const url = financeRecordApiRoutes.getPaginatedList({ cursor, searchFilters })

  return apiClient.get(url, { signal })
}

export function useInfiniteQueryFinanceRecords() {
  const searchProvider = inject(
    FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  ) as FinanceRecordSearchFiltersProvider
  const queryKey = computed(() =>
    financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters }),
  )

  useCleanUpInfiniteQuery(queryKey)

  return useInfiniteQuery({
    queryKey,
    queryFn: fetchPaginatedFinanceRecords,
    initialPageParam: {} as FinanceRecordSearchCursor,
    getNextPageParam: (lastPage, _) => {
      if (!lastPage.hasNextPage) return null
      return getFinanceRecordsSearchCursor(searchProvider.filters, lastPage.items[0])
    },
  })
}
