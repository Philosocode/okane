// External
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type ApiPaginatedResponse } from '@shared/services/apiClient/types'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { removeItemFromPages } from '@shared/utils/pagination'

function deleteFinanceRecord(id: number) {
  return apiClient.delete(financeRecordApiRoutes.deleteFinanceRecord({ id }))
}

export function useDeleteFinanceRecord() {
  const queryClient = useQueryClient()
  const searchStore = useFinanceRecordSearchStore()

  return useMutation({
    mutationFn: (financeRecord: FinanceRecord) => deleteFinanceRecord(financeRecord.id),
    onSuccess(_, deletedFinanceRecord) {
      queryClient.setQueryData<InfiniteData<ApiPaginatedResponse<FinanceRecord>>>(
        financeRecordQueryKeys.listByFilters({ filters: searchStore.filters }),
        (data) => {
          if (!data) return data
          return removeItemFromPages(data, (item) => item.id !== deletedFinanceRecord.id)
        },
      )

      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.stats({ filters: searchStore.filters }),
      })
    },
  })
}
