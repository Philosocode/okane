// External
import { type MaybeRefOrGetter, toValue } from 'vue'
import { type QueryKey, useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type PreCreationFinanceRecord } from '@features/financeRecords/types/saveFinanceRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'

function postFinanceRecord(financeRecord: PreCreationFinanceRecord) {
  return apiClient.post(financeRecordAPIRoutes.postFinanceRecord.buildPath(), financeRecord)
}

export function useCreateFinanceRecordMutation(queryKey: MaybeRefOrGetter<QueryKey>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (financeRecord: PreCreationFinanceRecord) => postFinanceRecord(financeRecord),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: toValue(queryKey) })
    },
  })
}
