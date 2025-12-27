// External
import { format, startOfDay, subDays } from 'date-fns'

// Internal
import { FINANCE_RECORD_TYPE_OPTIONS } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'

import { type SelectOption } from '@shared/components/form/FormSelect.vue'
import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

import { capitalize } from '@shared/utils/string'

// This enum needs to be here and not in constants to prevent an issue due to circular imports.
export enum HAPPENED_AT_TIMEFRAME {
  CUSTOM = 'custom',
  PAST_30_DAYS = 'past30Days',
  THIS_MONTH = 'thisMonth',
  THIS_YEAR = 'thisYear',
}

export const DEFAULT_FINANCE_RECORD_SEARCH_FILTERS: FinanceRecordSearchFilters = {
  description: '',
  type: '',

  sortDirection: SORT_DIRECTION.DESCENDING,
  sortField: 'happenedAt',

  amountOperator: COMPARISON_OPERATOR.GTE,
  happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.PAST_30_DAYS,
  happenedAt1: startOfDay(subDays(Date.now(), 30)),
  happenedAtOperator: COMPARISON_OPERATOR.GTE,

  tags: [],
}

interface TimeframeOption extends SelectOption {
  value: HAPPENED_AT_TIMEFRAME
}

export const HAPPENED_AT_TIMEFRAME_OPTIONS: TimeframeOption[] = [
  {
    label: FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.PAST_30_DAYS,
    value: HAPPENED_AT_TIMEFRAME.PAST_30_DAYS,
  },
  {
    label: format(new Date(Date.now()), 'MMMM'),
    value: HAPPENED_AT_TIMEFRAME.THIS_MONTH,
  },
  {
    label: format(new Date(Date.now()), 'y'),
    value: HAPPENED_AT_TIMEFRAME.THIS_YEAR,
  },
  {
    label: FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.CUSTOM,
    value: HAPPENED_AT_TIMEFRAME.CUSTOM,
  },
]

export const SEARCH_FINANCE_RECORDS_TYPE_OPTIONS: SelectOption[] = [
  { label: capitalize(SHARED_COPY.COMMON.ALL), value: '' },
  ...FINANCE_RECORD_TYPE_OPTIONS,
]

interface SortFieldOption extends SelectOption {
  value: FinanceRecordSearchFilters['sortField']
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

export const FINANCE_RECORD_SEARCH_QUERY_PARAM_NAMES = {
  DESCRIPTION: 'description',
  HAPPENED_AT_TIMEFRAME: 'happenedAtTimeframe',
  HAPPENED_BEFORE: 'happenedBefore',
  HAPPENED_AFTER: 'happenedAfter',
  MAX_AMOUNT: 'maxAmount',
  MIN_AMOUNT: 'minAmount',
  SORT_DIRECTION: 'sortDirection',
  SORT_FIELD: 'sortField',
  TAG_IDS: 'tagIds',
  TYPE: 'type',
} as const
