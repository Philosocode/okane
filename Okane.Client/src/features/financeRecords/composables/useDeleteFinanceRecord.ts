// External
import { inject } from 'vue'
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type ApiPaginatedResponse } from '@shared/services/apiClient/types'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { removeItemFromPages } from '@shared/utils/pagination'

function deleteFinanceRecord(id: number) {
  return apiClient.delete(financeRecordApiRoutes.deleteFinanceRecord({ id }))
}

export function useDeleteFinanceRecord() {
  const queryClient = useQueryClient()
  const searchProvider = inject(
    FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  ) as FinanceRecordSearchFiltersProvider

  return useMutation({
    mutationFn: (financeRecord: FinanceRecord) => deleteFinanceRecord(financeRecord.id),
    onSuccess(_, deletedFinanceRecord) {
      queryClient.setQueryData<InfiniteData<ApiPaginatedResponse<FinanceRecord>>>(
        financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters }),
        (data) => {
          if (!data) return data
          return removeItemFromPages(data, (item) => item.id !== deletedFinanceRecord.id)
        },
      )

      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.stats({ filters: searchProvider.filters }),
      })
    },
  })
}
