// External
import { computed, inject } from 'vue'
import { useQuery, type QueryFunctionContext } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { type FinanceRecordsStats } from '@features/financeRecords/types/financeRecordsStats'
import { type ApiResponse } from '@shared/services/apiClient/types'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

function fetchStats({
  queryKey,
  signal,
}: QueryFunctionContext): Promise<ApiResponse<FinanceRecordsStats>> {
  const searchFilters = queryKey[queryKey.length - 1] as FinanceRecordSearchFilters
  return apiClient.get(financeRecordApiRoutes.getStats({ searchFilters }), { signal })
}

export function useQueryFinanceRecordsStats() {
  const searchProvider = inject(
    FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  ) as FinanceRecordSearchFiltersProvider
  const queryKey = computed(() => financeRecordQueryKeys.stats({ filters: searchProvider.filters }))

  return useQuery({
    queryKey,
    queryFn: fetchStats,
  })
}
