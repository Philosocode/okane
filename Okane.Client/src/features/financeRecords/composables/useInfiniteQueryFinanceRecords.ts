// External
import { computed, type Ref } from 'vue'

import { type QueryFunctionContext, useInfiniteQuery } from '@tanstack/vue-query'

// Internal
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'
import { INITIAL_PAGE } from '@shared/constants/request'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'
import type { APIPaginatedResponse } from '@shared/services/apiClient/types'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { useCleanUpInfiniteQuery } from '@shared/composables/useCleanUpInfiniteQuery'
import { FINANCE_RECORD_QUERY_KEYS } from '@features/financeRecords/constants/queryKeys'
import type { FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'

export function fetchPaginatedFinanceRecords({
  pageParam,
  signal,
}: QueryFunctionContext): Promise<APIPaginatedResponse<FinanceRecord>> {
  return apiClient.get(
    FINANCE_RECORD_API_ROUTES.GET_PAGINATED_LIST.buildPath({ page: pageParam }),
    {
      signal,
    },
  )
}

export function useInfiniteQueryFinanceRecords(searchFilters?: Ref<FinanceRecordSearchFilters>) {
  const queryKey = computed(() =>
    FINANCE_RECORD_QUERY_KEYS.LIST_BY_FILTERS(
      searchFilters ?? DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
    ),
  )

  useCleanUpInfiniteQuery(queryKey)

  return useInfiniteQuery({
    enabled: Boolean(searchFilters),
    queryKey,
    queryFn: fetchPaginatedFinanceRecords,
    initialPageParam: INITIAL_PAGE,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.hasNextPage ? lastPageParam + 1 : undefined
    },
  })
}
