// External
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import type { Ref } from 'vue'

// Internal
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'
import { FINANCE_RECORD_QUERY_KEYS } from '@features/financeRecords/constants/financeRecord.constants'

import type {
  FinanceRecordSearchFilters,
  PreCreationFinanceRecord,
} from '@features/financeRecords/types/financeRecord.types'

import { apiClient } from '@shared/services/apiClient/apiClient.service'

function postFinanceRecord(financeRecord: PreCreationFinanceRecord) {
  return apiClient.post(FINANCE_RECORD_API_ROUTES.GET_PAGINATED_LIST.basePath, financeRecord)
}

export function useCreateFinanceRecordMutation(searchFilters?: Ref<FinanceRecordSearchFilters>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postFinanceRecord,
    onSuccess() {
      if (searchFilters) {
        void queryClient.invalidateQueries({
          queryKey: FINANCE_RECORD_QUERY_KEYS.LIST_BY_FILTERS(searchFilters.value),
        })
      }
    },
  })
}
