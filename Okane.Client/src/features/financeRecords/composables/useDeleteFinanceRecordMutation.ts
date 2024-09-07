// External
import { toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQueryClient, type InfiniteData, type QueryKey } from '@tanstack/vue-query'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { apiClient } from '@shared/services/apiClient/apiClient'

import type { APIPaginatedResponse } from '@shared/services/apiClient/types'
import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { removeItemFromPages } from '@shared/utils/pagination'

function deleteFinanceRecord(id: number) {
  return apiClient.delete(financeRecordAPIRoutes.deleteFinanceRecord.buildPath({ id }))
}

export function useDeleteFinanceRecordMutation(queryKey: MaybeRefOrGetter<QueryKey>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteFinanceRecord(id),
    onSuccess(_, id) {
      queryClient.setQueryData<InfiniteData<APIPaginatedResponse<FinanceRecord>>>(
        toValue(queryKey),
        (data) => {
          if (!data) return data
          return removeItemFromPages(data, (item) => item.id !== id)
        },
      )
    },
  })
}
