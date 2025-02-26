// External
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type CreateFinanceRecordRequest } from '@features/financeRecords/types/saveFinanceRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

function postFinanceRecord(financeRecord: CreateFinanceRecordRequest) {
  return apiClient.post(financeRecordApiRoutes.postFinanceRecord(), financeRecord)
}

export function useCreateFinanceRecord() {
  const queryClient = useQueryClient()
  const searchStore = useFinanceRecordSearchStore()

  return useMutation({
    mutationFn: postFinanceRecord,
    onSuccess() {
      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.listByFilters({ filters: searchStore.filters }),
      })

      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.stats({ filters: searchStore.filters }),
      })
    },
  })
}
