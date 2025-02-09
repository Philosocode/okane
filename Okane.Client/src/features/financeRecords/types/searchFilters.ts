// External
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'

import { type FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { type Tag } from '@shared/types/tag'

export type FinanceRecordSearchFilters = {
  description: string
  type: '' | FINANCE_RECORD_TYPE

  sortDirection: SORT_DIRECTION
  sortField: 'amount' | 'happenedAt'

  amount1?: number
  amount2?: number
  amountOperator?: COMPARISON_OPERATOR

  happenedAt1?: Date
  happenedAt2?: Date
  happenedAtOperator?: COMPARISON_OPERATOR

  tags: Tag[]
}

export type FinanceRecordSearchFiltersFormState = Omit<
  FinanceRecordSearchFilters,
  'amount1' | 'amount2' | 'amountOperator' | 'happenedAt1' | 'happenedAt2' | 'happenedAtOperator'
> & {
  amount1: string
  amount2: string
  amountOperator: string
  happenedAt1: string
  happenedAt2: string
  happenedAtOperator: string
}

export type FinanceRecordSearchCursor = {
  id?: number

  // Only one of these two fields should be set.
  amount?: number
  happenedAt?: Date
}
