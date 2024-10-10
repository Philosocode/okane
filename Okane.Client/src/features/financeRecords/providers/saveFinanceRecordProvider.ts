// External
import { ref, type InjectionKey } from 'vue'

// Internal
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type SaveFinanceRecordProvider = ReturnType<typeof useSaveFinanceRecordProvider>

export const SAVE_FINANCE_RECORD_SYMBOL = Symbol() as InjectionKey<SaveFinanceRecordProvider>

export function useSaveFinanceRecordProvider() {
  const isCreating = ref(false)
  const editingFinanceRecord = ref<FinanceRecord>()

  function setIsCreating(value: boolean) {
    isCreating.value = value
  }

  function setEditingFinanceRecord(financeRecord?: FinanceRecord) {
    editingFinanceRecord.value = financeRecord
  }

  return {
    get editingFinanceRecord() {
      return editingFinanceRecord.value
    },
    get isCreating() {
      return isCreating.value
    },

    setIsCreating,
    setEditingFinanceRecord,
  }
}
