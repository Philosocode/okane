// External
import { inject } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type CreateFinanceRecordRequest } from '@features/financeRecords/types/saveFinanceRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

function postFinanceRecord(financeRecord: CreateFinanceRecordRequest) {
  return apiClient.post(financeRecordApiRoutes.postFinanceRecord(), financeRecord)
}

export function useCreateFinanceRecord() {
  const queryClient = useQueryClient()
  const searchProvider = inject(
    FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  ) as FinanceRecordSearchFiltersProvider

  return useMutation({
    mutationFn: postFinanceRecord,
    onSuccess() {
      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters }),
      })

      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.stats({ filters: searchProvider.filters }),
      })
    },
  })
}
