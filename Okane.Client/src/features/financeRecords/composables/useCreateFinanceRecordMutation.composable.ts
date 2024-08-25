// External
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { FINANCE_RECORD_QUERY_KEYS } from '@features/financeRecords/constants/financeRecord.constants'

import type { PreCreationFinanceRecord } from '@features/financeRecords/types/financeRecord.types'

import { apiClient } from '@shared/services/apiClient/apiClient.service'

function postFinanceRecord(financeRecord: PreCreationFinanceRecord) {
  return apiClient.post('/finance-records', financeRecord)
}

export function useCreateFinanceRecordMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postFinanceRecord,
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: FINANCE_RECORD_QUERY_KEYS.LISTS() })
    },
  })
}
