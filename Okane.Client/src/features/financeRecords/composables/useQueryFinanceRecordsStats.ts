// External
import { computed, inject } from 'vue'
import { useQuery, type QueryFunctionContext } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'
import { type FinanceRecordsStats } from '@features/financeRecords/types/financeRecordsStats'
import { type ApiResponse } from '@shared/services/apiClient/types'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

function fetchStats({
  queryKey,
  signal,
}: QueryFunctionContext): Promise<ApiResponse<FinanceRecordsStats>> {
  const searchFilters = queryKey[queryKey.length - 1] as FinanceRecordsSearchFilters
  return apiClient.get(financeRecordApiRoutes.getStats({ searchFilters }), { signal })
}

export function useQueryFinanceRecordsStats() {
  const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
  const queryKey = computed(() => financeRecordQueryKeys.stats({ filters: searchProvider.filters }))

  return useQuery({
    queryKey,
    queryFn: fetchStats,
  })
}
