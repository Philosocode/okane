// External
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type FinanceRecordSearchStore = ReturnType<typeof useFinanceRecordSearchStore>

export const useFinanceRecordSearchStore = defineStore('FinanceRecordsSearchStore', () => {
  const filters = ref<FinanceRecordSearchFilters>({ ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS })
  const modalIsShowing = ref(false)

  function setFilters(updates: Partial<FinanceRecordSearchFilters>) {
    filters.value = {
      ...filters.value,
      ...updates,
    }
  }

  function setModalIsShowing(value: boolean) {
    modalIsShowing.value = value
  }

  return {
    filters,
    modalIsShowing,

    setFilters,
    setModalIsShowing,
  }
})
