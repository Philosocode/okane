// External
import type { InjectionKey, Ref } from 'vue'

// Internal
import type { FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

export const FINANCE_RECORD_SEARCH_FILTERS_KEY = Symbol(
  'financeRecordSearchFilters',
) as InjectionKey<Ref<FinanceRecordSearchFilters>>

export const DEFAULT_FINANCE_RECORD_SEARCH_FILTERS: FinanceRecordSearchFilters = {}
