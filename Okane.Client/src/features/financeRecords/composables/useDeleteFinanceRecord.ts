// External
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { apiClient } from '@shared/services/apiClient/apiClient'

import type { APIPaginatedResponse } from '@shared/services/apiClient/types'
import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { removeItemFromPages } from '@shared/utils/pagination'
import { useSearchFinanceRecordsProvider } from '@features/financeRecords/providers/searchFinanceRecordsProvider'

function deleteFinanceRecord(id: number) {
  return apiClient.delete(financeRecordAPIRoutes.deleteFinanceRecord({ id }))
}

export function useDeleteFinanceRecord() {
  const queryClient = useQueryClient()
  const searchProvider = useSearchFinanceRecordsProvider()

  return useMutation({
    mutationFn: (id: number) => deleteFinanceRecord(id),
    onSuccess(_, id) {
      queryClient.setQueryData<InfiniteData<APIPaginatedResponse<FinanceRecord>>>(
        financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters }),
        (data) => {
          if (!data) return data
          return removeItemFromPages(data, (item) => item.id !== id)
        },
      )

      void queryClient.invalidateQueries({
        queryKey: financeRecordQueryKeys.stats({ filters: searchProvider.filters }),
      })
    },
  })
}
