// External
import { ref, type InjectionKey } from 'vue'

// Internal
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type DeleteFinanceRecordProvider = ReturnType<typeof useDeleteFinanceRecordProvider>

export const DELETE_FINANCE_RECORD_SYMBOL = Symbol() as InjectionKey<DeleteFinanceRecordProvider>

export function useDeleteFinanceRecordProvider() {
  const financeRecordToDelete = ref<FinanceRecord | undefined>()

  function setFinanceRecordToDelete(financeRecord?: FinanceRecord) {
    financeRecordToDelete.value = financeRecord
  }

  return {
    get financeRecordToDelete() {
      return financeRecordToDelete.value
    },
    setFinanceRecordToDelete,
  }
}
