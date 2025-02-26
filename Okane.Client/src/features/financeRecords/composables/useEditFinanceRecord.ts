// External
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type EditFinanceRecordRequest } from '@features/financeRecords/types/saveFinanceRecord'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

import { apiClient } from '@shared/services/apiClient/apiClient'

function patchFinanceRecord(id: number, request: EditFinanceRecordRequest) {
  return apiClient.patch(financeRecordApiRoutes.patchFinanceRecord({ id }), request)
}

type MutationArgs = {
  id: number
  request: EditFinanceRecordRequest
}

export function useEditFinanceRecord() {
  const searchStore = useFinanceRecordSearchStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: MutationArgs) => patchFinanceRecord(args.id, args.request),
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
