// External
import { ref, type InjectionKey } from 'vue'

// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export type FinanceRecordSearchFiltersProvider = ReturnType<
  typeof useFinanceRecordSearchFiltersProvider
>

export const FINANCE_RECORD_SEARCH_FILTERS_SYMBOL = Symbol(
  'financeRecordSearchFilters',
) as InjectionKey<FinanceRecordSearchFiltersProvider>

export function useFinanceRecordSearchFiltersProvider() {
  const modalIsShowing = ref(false)
  const filters = ref<FinanceRecordSearchFilters>({ ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS })

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
