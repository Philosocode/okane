// External
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DeleteFinanceRecordStore = ReturnType<typeof useDeleteFinanceRecordStore>

export const useDeleteFinanceRecordStore = defineStore('DeleteFinanceRecordStore', () => {
  const financeRecordId = ref<number>()

  function setDeletingFinanceRecordId(id: number) {
    financeRecordId.value = id
  }

  function clearDeletingFinanceRecordId() {
    financeRecordId.value = undefined
  }

  return {
    financeRecordId,

    clearDeletingFinanceRecordId,
    setDeletingFinanceRecordId,
  }
})
