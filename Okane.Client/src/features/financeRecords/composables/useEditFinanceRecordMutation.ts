// External
import { toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'

function patchFinanceRecord(id: number, changes: Partial<FinanceRecord>) {
  return apiClient.patch(financeRecordAPIRoutes.patchFinanceRecord({ id }), changes)
}

type MutationArgs = {
  changes: Partial<FinanceRecord>
  id: number
}

export function useEditFinanceRecordMutation(queryKey: MaybeRefOrGetter<QueryKey>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: MutationArgs) => patchFinanceRecord(args.id, args.changes),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: toValue(queryKey) })
    },
  })
}
