// External
import { computed, inject } from 'vue'

import { type QueryFunctionContext, useInfiniteQuery } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { INITIAL_PAGE } from '@shared/constants/request'

import { type APIPaginatedResponse } from '@shared/services/apiClient/types'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import { useCleanUpInfiniteQuery } from '@shared/composables/useCleanUpInfiniteQuery'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

export function fetchPaginatedFinanceRecords({
  pageParam,
  queryKey,
  signal,
}: QueryFunctionContext): Promise<APIPaginatedResponse<FinanceRecord>> {
  const searchFilters = queryKey[queryKey.length - 1] as FinanceRecordsSearchFilters
  const url = financeRecordAPIRoutes.getPaginatedList({
    page: pageParam,
    searchFilters,
  })
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
    initialPageParam: INITIAL_PAGE,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.hasNextPage ? lastPageParam + 1 : undefined
    },
  })
}
