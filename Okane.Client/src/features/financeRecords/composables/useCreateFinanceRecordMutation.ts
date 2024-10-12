// External
import { inject } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type PreCreationFinanceRecord } from '@features/financeRecords/types/saveFinanceRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

function postFinanceRecord(financeRecord: PreCreationFinanceRecord) {
  return apiClient.post(financeRecordAPIRoutes.postFinanceRecord(), financeRecord)
}

export function useCreateFinanceRecordMutation() {
  const queryClient = useQueryClient()
  const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider

  return useMutation({
    mutationFn: (financeRecord: PreCreationFinanceRecord) => postFinanceRecord(financeRecord),
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
