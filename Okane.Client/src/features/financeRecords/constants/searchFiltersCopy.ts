// External
import { format } from 'date-fns'

// Internal
import { COMMON_DATE_FORMAT } from '@shared/constants/dateTime'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { type FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { type Tag } from '@shared/types/tag'

export const FINANCES_SEARCH_FILTERS_COPY = {
  APPLIED_AMOUNT_AND_OPERATOR(args: { amount: number; operator: COMPARISON_OPERATOR }) {
    return `Amount ${args.operator} ${FINANCES_COPY.MONEY({ amount: args.amount })}`
  },
  APPLIED_AMOUNT_RANGE(args: { amount1: number; amount2: number }) {
    return [
      `Amount ${COMPARISON_OPERATOR.GTE} ${FINANCES_COPY.MONEY({ amount: args.amount1 })}`,
      SHARED_COPY.CONJUNCTIONS.AND,
      `${COMPARISON_OPERATOR.LTE} ${FINANCES_COPY.MONEY({ amount: args.amount2 })}`,
    ].join(' ')
  },
  APPLIED_DESCRIPTION(args: { description: string }) {
    return `Description contains “${args.description}”`
  },
  APPLIED_HAPPENED_AT_AND_OPERATOR(args: { happenedAt: Date; operator: COMPARISON_OPERATOR }) {
    let operator = 'at'
    if (args.operator === COMPARISON_OPERATOR.GTE) {
      operator = 'on/after'
    } else if (args.operator === COMPARISON_OPERATOR.LTE) {
      operator = 'on/before'
    }

    return `Happened ${operator} ${format(args.happenedAt, COMMON_DATE_FORMAT)}`
  },
  APPLIED_HAPPENED_AT_RANGE(args: { happenedAt1: Date; happenedAt2: Date }) {
    return [
      `Happened on/after ${format(args.happenedAt1, COMMON_DATE_FORMAT)}`,
      'and',
      `on/before ${format(args.happenedAt2, COMMON_DATE_FORMAT)}`,
    ].join(' ')
  },
  APPLIED_SORTING(args: {
    sortDirection: SORT_DIRECTION
    sortField: FinanceRecordSearchFilters['sortField']
  }) {
    let direction = 'ascending'
    if (args.sortDirection === 'desc') direction = 'descending'

    let field = 'amount'
    if (args.sortField === 'happenedAt') field = 'happened at'

    return `Sorting by “${field}”, ${direction}`
  },
  APPLIED_TAGS(args: { tags: Tag[] }) {
    const tagNames = args.tags.map((tag) => tag.name)
    return `Contains at least one of these tags: ${tagNames.join(', ')}`
  },
  APPLIED_TYPE: (args: { type: FINANCE_RECORD_TYPE }) => `Type is ${args.type}`,
}
