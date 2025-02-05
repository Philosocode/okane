// External
import { format } from 'date-fns'

// Internal
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'
import { SHARED_COPY } from '@shared/constants/copy'

import { type FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'
import { type Tag } from '@shared/types/tag'
import { COMMON_DATE_FORMAT } from '@shared/constants/dateTime'

export const FINANCES_COPY = {
  DELETE_FINANCE_RECORD_MODAL: {
    CONFIRMATION_TEXT: 'You are about to delete the following finance record:',
    DELETE_FINANCE_RECORD: 'Delete Finance Record',
    ERROR: 'Error deleting finance record. Please refresh the page and try again.',
  },

  FINANCES: 'Finances',

  INFINITE_LIST: {
    NO_FINANCE_RECORDS: 'No matching finance records.',
  },

  MANAGE_TAGS: 'Manage Tags',

  MONEY(args: { amount: number; type?: FINANCE_RECORD_TYPE }) {
    let symbol = ''
    if (args.amount > 0) {
      if (args.type === 'Expense') symbol = '-'
      if (args.type === 'Revenue') symbol = '+'
    }

    return `${symbol}$${args.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  },

  PROPERTIES: {
    AMOUNT: 'Amount',
    DESCRIPTION: 'Description',
    HAPPENED_AT: 'Happened At',
    TAGS: 'Tags',
    TYPE: 'Type',
  },

  RECORD_TYPES: {
    EXPENSE: 'Expense',
    REVENUE: 'Revenue',
  },

  SAVE_FINANCE_RECORD_MODAL: {
    CREATE_FINANCE_RECORD: 'Create Finance Record',
    EDIT_FINANCE_RECORD: 'Edit Finance Record',
    SHOW_MODAL: 'Show save finance record modal.',
    TOASTS: {
      CREATE_SUCCESS: 'Successfully created finance record.',
      EDIT_SUCCESS: 'Successfully saved finance record.',
    },
  },

  SEARCH_FILTERS: {
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
  },

  SEARCH_FINANCE_RECORDS_MODAL: {
    APPLIED_SEARCH_FILTERS: 'Applied Search Filters',
    EDIT_SEARCH_FILTERS: 'Edit Search Filters',
    HAPPENED_AFTER: 'Happened after',
    HAPPENED_BEFORE: 'Happened before',
    MAX_AMOUNT: 'Max amount',
    MIN_AMOUNT: 'Min amount',
  },

  STATS: {
    EXPENSES: 'Expenses',
    FETCH_ERROR: 'Error fetching stats. Please try again.',
    RECORD: 'record',
    TOTAL_AMOUNT(args: { amount: number; type: FINANCE_RECORD_TYPE }) {
      let symbol = ''
      if (args.amount > 0 && args.type === 'Revenue') symbol = '+'
      if (args.amount > 0 && args.type === 'Expense') symbol = '-'

      return `${symbol}$${args.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
  },
} as const
