// External
import { ref } from 'vue'

import { type QueryFunctionContext, useInfiniteQuery } from '@tanstack/vue-query'

// Internal
import { FINANCE_RECORD_QUERY_KEYS } from '@features/financeRecords/constants/financeRecord.constants'
import { DEFAULT_PAGE_SIZE, INITIAL_PAGE } from '@shared/constants/request.constants'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord.types'
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

export function useInfiniteQueryFinanceRecords() {
  const queryKey = ref(FINANCE_RECORD_QUERY_KEYS.LIST_BY_FILTERS())

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
