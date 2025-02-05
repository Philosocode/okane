// External
import { inject } from 'vue'
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/vue-query'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type FinanceRecordsStats } from '@features/financeRecords/types/financeRecordsStats'
import { type ApiPaginatedResponse, type ApiResponse } from '@shared/services/apiClient/types'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { removeItemFromPages } from '@shared/utils/pagination'

function deleteFinanceRecord(id: number) {
  return apiClient.delete(financeRecordApiRoutes.deleteFinanceRecord({ id }))
}

export function useDeleteFinanceRecord() {
  const queryClient = useQueryClient()
  const searchProvider = inject(SEARCH_FINANCE_RECORDS_SYMBOL) as SearchFinanceRecordsProvider

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

      queryClient.setQueryData<ApiResponse<FinanceRecordsStats>>(
        financeRecordQueryKeys.stats({ filters: searchProvider.filters }),
        (data) => {
          if (!data) return data

          const updatedStats = { ...data.items[0] }
          if (deletedFinanceRecord.type === FINANCE_RECORD_TYPE.EXPENSE) {
            updatedStats.totalExpenses -= deletedFinanceRecord.amount
            updatedStats.expenseRecords--
          } else {
            updatedStats.totalRevenue -= deletedFinanceRecord.amount
            updatedStats.revenueRecords--
          }

          return {
            ...data,
            items: [updatedStats],
          }
        },
      )
    },
  })
}
