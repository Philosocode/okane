// External
import { startOfMonth } from 'date-fns'

// Internal
import { FINANCE_RECORD_TYPE_OPTIONS } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'
import { type SelectOption } from '@shared/components/form/FormSelect.vue'

import { capitalize } from '@shared/utils/string'

export const DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS: FinanceRecordsSearchFilters = {
  description: '',
  type: '',

  sortDirection: SORT_DIRECTION.DESCENDING,
  sortField: 'happenedAt',

  amountOperator: COMPARISON_OPERATOR.GTE,
  happenedAt1: startOfMonth(new Date(Date.now())),
  happenedAtOperator: COMPARISON_OPERATOR.GTE,
}

export const SEARCH_FINANCE_RECORDS_TYPE_OPTIONS: SelectOption[] = [
  { label: capitalize(SHARED_COPY.COMMON.ALL), value: '' },
  ...FINANCE_RECORD_TYPE_OPTIONS,
]

interface SortFieldOption extends SelectOption {
  value: FinanceRecordsSearchFilters['sortField']
}

export const FINANCE_RECORD_SORT_FIELD_OPTIONS: SortFieldOption[] = [
  {
    label: FINANCES_COPY.PROPERTIES.HAPPENED_AT,
    value: 'happenedAt',
  },
  {
    label: FINANCES_COPY.PROPERTIES.AMOUNT,
    value: 'amount',
  },
]
