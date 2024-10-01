// External
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { type QueryFunctionContext, useInfiniteQuery } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { INITIAL_PAGE } from '@shared/constants/request'

import { type APIPaginatedResponse } from '@shared/services/apiClient/types'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import { useCleanUpInfiniteQuery } from '@shared/composables/useCleanUpInfiniteQuery'

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

export function useInfiniteQueryFinanceRecords(
  searchFilters: MaybeRefOrGetter<FinanceRecordsSearchFilters>,
) {
  const queryKey = computed(() => financeRecordQueryKeys.listByFilters(toValue(searchFilters)))

  useCleanUpInfiniteQuery(queryKey)

  return useInfiniteQuery({
    enabled: Boolean(toValue(searchFilters)),
    queryKey,
    queryFn: fetchPaginatedFinanceRecords,
    initialPageParam: INITIAL_PAGE,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.hasNextPage ? lastPageParam + 1 : undefined
    },
  })
}
