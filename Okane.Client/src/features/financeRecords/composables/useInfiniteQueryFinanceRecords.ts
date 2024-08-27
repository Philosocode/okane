// External
import { computed, type Ref } from 'vue'

import { type QueryFunctionContext, useInfiniteQuery } from '@tanstack/vue-query'

// Internal
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_QUERY_KEYS,
} from '@features/financeRecords/constants/financeRecord.constants'
import { DEFAULT_PAGE_SIZE, INITIAL_PAGE } from '@shared/constants/request.constants'

import type {
  FinanceRecord,
  FinanceRecordSearchFilters,
} from '@features/financeRecords/types/financeRecord.types'
import type { APIPaginatedResponse } from '@shared/services/apiClient/apiClient.types'

import { apiClient } from '@shared/services/apiClient/apiClient.service'

import { useCleanUpInfiniteQuery } from '@shared/composables/useCleanUpInfiniteQuery'

export function fetchPaginatedFinanceRecords({
  pageParam,
  signal,
}: QueryFunctionContext): Promise<APIPaginatedResponse<FinanceRecord>> {
  return apiClient.get(`/finance-records?page=${pageParam}&pageSize=${DEFAULT_PAGE_SIZE}`, {
    signal,
  })
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
