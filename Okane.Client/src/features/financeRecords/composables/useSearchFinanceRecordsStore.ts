// External
import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type QueryFinanceRecordStore = ReturnType<typeof useSearchFinanceRecordsStore>

export const useSearchFinanceRecordsStore = defineStore('QueryFinanceRecordStore', () => {
  const searchFilters = ref<FinanceRecordSearchFilters>({})

  return {
    searchFilters,
  }
})
