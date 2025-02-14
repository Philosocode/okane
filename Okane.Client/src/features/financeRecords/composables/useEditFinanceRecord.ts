// External
import { inject } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type EditFinanceRecordRequest } from '@features/financeRecords/types/saveFinanceRecord'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

function patchFinanceRecord(id: number, request: EditFinanceRecordRequest) {
  return apiClient.patch(financeRecordApiRoutes.patchFinanceRecord({ id }), request)
}

type MutationArgs = {
  id: number
  request: EditFinanceRecordRequest
}

export function useEditFinanceRecord() {
  const searchProvider = inject(
    FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  ) as FinanceRecordSearchFiltersProvider
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: MutationArgs) => patchFinanceRecord(args.id, args.request),
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
