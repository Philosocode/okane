// External
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'

import { type FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

export type FinanceRecordsSearchFilters = {
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
}
