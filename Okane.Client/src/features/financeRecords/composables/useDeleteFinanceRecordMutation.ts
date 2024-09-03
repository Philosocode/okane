// External
import type { Ref } from 'vue'
import { type InfiniteData, type QueryKey, useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'

import { apiClient } from '@shared/services/apiClient/apiClient'

import type { APIPaginatedResponse } from '@shared/services/apiClient/types'
import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { removeItemFromPages } from '@shared/utils/pagination'

function deleteFinanceRecord(id: number) {
  return apiClient.delete(FINANCE_RECORD_API_ROUTES.DELETE_FINANCE_RECORD.buildPath({ id }))
}

export function useDeleteFinanceRecordMutation(id: Ref<number>, queryKey: Ref<QueryKey>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteFinanceRecord(id.value),
    onSuccess() {
      queryClient.setQueryData<InfiniteData<APIPaginatedResponse<FinanceRecord>>>(
        queryKey.value,
        (data) => {
          if (!data) return data
          return removeItemFromPages(data, (item) => item.id !== id.value)
        },
      )
    },
  })
}
