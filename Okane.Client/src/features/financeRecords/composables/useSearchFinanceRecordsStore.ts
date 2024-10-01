// External
import { defineStore } from 'pinia'
import { ref } from 'vue'

/// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'

import type { FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

export type SearchFinanceRecordsStore = ReturnType<typeof useSearchFinanceRecordsStore>

export const useSearchFinanceRecordsStore = defineStore('SearchFinanceRecordStore', () => {
  const modalIsShowing = ref(false)
  const searchFilters = ref<FinanceRecordsSearchFilters>(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)

  function setModalIsShowing(value: boolean) {
    modalIsShowing.value = value
  }

  return {
    modalIsShowing,
    searchFilters,

    setModalIsShowing,
  }
})
