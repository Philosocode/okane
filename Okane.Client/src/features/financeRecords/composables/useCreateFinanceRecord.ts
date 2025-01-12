// External
import { inject } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type CreateFinanceRecordRequest } from '@features/financeRecords/types/saveFinanceRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

function postFinanceRecord(financeRecord: CreateFinanceRecordRequest) {
  return apiClient.post(financeRecordAPIRoutes.postFinanceRecord(), financeRecord)
}

export function useCreateFinanceRecord() {
  const queryClient = useQueryClient()
  const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider

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
