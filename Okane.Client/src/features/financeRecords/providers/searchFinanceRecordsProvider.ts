// External
import { ref, type InjectionKey } from 'vue'

// Internal
import { DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

export type SearchFinanceRecordsProvider = ReturnType<typeof useSearchFinanceRecordsProvider>

export const SEARCH_FINANCE_RECORDS_SYMBOL = Symbol(
  'searchFinanceRecords',
) as InjectionKey<SearchFinanceRecordsProvider>

export function useSearchFinanceRecordsProvider() {
  const modalIsShowing = ref(false)
  const filters = ref<FinanceRecordsSearchFilters>({ ...DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS })

  function setFilters(updates: Partial<FinanceRecordsSearchFilters>) {
    filters.value = {
      ...filters.value,
      ...updates,
    }
  }

  function setModalIsShowing(value: boolean) {
    modalIsShowing.value = value
  }

  return {
    get filters() {
      return filters.value
    },
    get modalIsShowing() {
      return modalIsShowing.value
    },

    setFilters,
    setModalIsShowing,
  }
}
