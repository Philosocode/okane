// External
import type { InjectionKey, Ref } from 'vue'

// Internal
import type { FinanceRecordSearchFilters } from '@features/financeRecords/types/financeRecord.types'
import type { SelectOption } from '@shared/components/form/FormSelect.vue'

export enum FINANCE_RECORD_TYPE {
  EXPENSE = 'Expense',
  REVENUE = 'Revenue',
}

export const FINANCE_RECORD_TYPE_OPTIONS: SelectOption[] = Object.values(FINANCE_RECORD_TYPE).map(
  (type) => ({
    value: type,
    label: type,
  }),
)

export const FINANCE_RECORD_DESCRIPTION_MAX_LENGTH = 100
export const FINANCE_RECORD_MIN_AMOUNT = 0.01
export const FINANCE_RECORD_MAX_AMOUNT = 9_999_999.99

const queryKeys = {
  ALL: () => ['all'],
  LISTS: () => [...queryKeys.ALL(), 'lists'],
  LIST_BY_FILTERS: (filters: FinanceRecordSearchFilters) => [...queryKeys.LISTS(), 'list', filters],
}

export const FINANCE_RECORD_QUERY_KEYS = queryKeys

export const FINANCE_RECORD_SEARCH_FILTERS_KEY = Symbol(
  'financeRecordSearchFilters',
) as InjectionKey<Ref<FinanceRecordSearchFilters>>

export const DEFAULT_FINANCE_RECORD_SEARCH_FILTERS: FinanceRecordSearchFilters = {}
