// External
import type { FinanceRecord } from '@features/financeRecords/types/financeRecord.types'

import { apiClient } from '@shared/services/apiClient/apiClient.service'

export function useSaveFinanceRecord() {
  function saveFinanceRecord(financeRecord: FinanceRecord) {
    return apiClient.post('/finance-records', financeRecord)
  }

  return { saveFinanceRecord }
}
