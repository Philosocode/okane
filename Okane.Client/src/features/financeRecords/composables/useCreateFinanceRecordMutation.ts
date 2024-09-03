// External
import { type QueryKey, useMutation, useQueryClient } from '@tanstack/vue-query'

import type { Ref } from 'vue'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import type { PreCreationFinanceRecord } from '@features/financeRecords/types/saveFinanceRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'

function postFinanceRecord(financeRecord: PreCreationFinanceRecord) {
  return apiClient.post(financeRecordAPIRoutes.postFinanceRecord.buildPath(), financeRecord)
}

export function useCreateFinanceRecordMutation(queryKey: Ref<QueryKey>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postFinanceRecord,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: queryKey.value })
    },
  })
}
