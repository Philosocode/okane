// External
import { ref, type InjectionKey } from 'vue'

// Internal
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type SaveFinanceRecordProvider = ReturnType<typeof useSaveFinanceRecordProvider>

export const SAVE_FINANCE_RECORD_SYMBOL = Symbol() as InjectionKey<SaveFinanceRecordProvider>

export function useSaveFinanceRecordProvider() {
  const isCreating = ref(false)
  const financeRecordToEdit = ref<FinanceRecord>()

  function setIsCreating(value: boolean) {
    isCreating.value = value
  }

  function setFinanceRecordToEdit(financeRecord?: FinanceRecord) {
    financeRecordToEdit.value = financeRecord
  }

  return {
    get financeRecordToEdit() {
      return financeRecordToEdit.value
    },
    get isCreating() {
      return isCreating.value
    },

    setIsCreating,
    setFinanceRecordToEdit,
  }
}
