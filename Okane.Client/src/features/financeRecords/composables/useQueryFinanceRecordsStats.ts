// External
import { computed, inject, toValue } from 'vue'
import { useQuery, type QueryFunctionContext } from '@tanstack/vue-query'

import { type MaybeRef } from '@vueuse/core'

// Internal
import { DEFAULT_FINANCES_TIME_INTERVAL } from '@features/financeRecords/constants/stats'
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type ApiResponse } from '@shared/services/apiClient/types'
import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { type FinanceRecordsStats } from '@features/financeRecords/types/financeRecordsStats'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

function fetchStats({
  queryKey,
  signal,
}: QueryFunctionContext): Promise<ApiResponse<FinanceRecordsStats>> {
  const n = queryKey.length
  const searchFilters = queryKey[n - 2] as FinanceRecordSearchFilters
  const timeInterval = queryKey[n - 1] as string

  return apiClient.get(financeRecordApiRoutes.getStats({ searchFilters, timeInterval }), { signal })
}

export function useQueryFinanceRecordsStats(
  timeInterval: MaybeRef<string> = DEFAULT_FINANCES_TIME_INTERVAL,
) {
  const searchProvider = inject(
    FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  ) as FinanceRecordSearchFiltersProvider
  const queryKey = computed(() =>
    financeRecordQueryKeys.statsWithTimeInterval({
      filters: searchProvider.filters,
      timeInterval: toValue(timeInterval),
    }),
  )

  return useQuery({
    queryKey,
    queryFn: fetchStats,
    select(data) {
      return data.items[0]
    },
  })
}
