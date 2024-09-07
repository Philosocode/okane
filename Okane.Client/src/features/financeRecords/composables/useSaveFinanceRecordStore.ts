// External
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Internal
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type SaveFinanceRecordStore = ReturnType<typeof useSaveFinanceRecordStore>

export const useSaveFinanceRecordStore = defineStore('SaveFinanceRecordStore', () => {
  const isCreating = ref(false)
  const editingFinanceRecord = ref<FinanceRecord>()

  function setIsCreating(value: boolean) {
    isCreating.value = value
  }

  function setEditingFinanceRecord(financeRecord?: FinanceRecord) {
    editingFinanceRecord.value = financeRecord
  }

  return {
    editingFinanceRecord,
    isCreating,

    setIsCreating,
    setEditingFinanceRecord,
  }
})
