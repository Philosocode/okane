// External
import { inject } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

function patchFinanceRecord(id: number, changes: Partial<FinanceRecord>) {
  return apiClient.patch(financeRecordAPIRoutes.patchFinanceRecord({ id }), changes)
}

type MutationArgs = {
  changes: Partial<FinanceRecord>
  id: number
}

export function useEditFinanceRecordMutation() {
  const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: MutationArgs) => patchFinanceRecord(args.id, args.changes),
    onSuccess() {
      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.listByFilters(searchProvider.filters),
      })
      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.stats(searchProvider.filters),
      })
    },
  })
}
