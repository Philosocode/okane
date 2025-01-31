import type { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

export const FINANCES_COPY = {
  DELETE_FINANCE_RECORD_MODAL: {
    ARE_YOU_SURE: 'Are you sure you want to delete this finance record?',
    DELETE_FINANCE_RECORD: 'Delete Finance Record',
  },

  FINANCES: 'Finances',

  INFINITE_LIST: {
    NO_FINANCE_RECORDS: "No finance records. Why don't you create one?",
  },

  MANAGE_TAGS: 'Manage Tags',

  PROPERTIES: {
    AMOUNT: 'Amount',
    DESCRIPTION: 'Description',
    HAPPENED_AT: 'Happened At',
    TYPE: 'Type',
  },

  RECORD_TYPES: {
    EXPENSE: 'Expense',
    REVENUE: 'Revenue',
  },

  SAVE_FINANCE_RECORD_MODAL: {
    CREATE_FINANCE_RECORD: 'Create Finance Record',
    CREATE_SUCCESS_TOAST: 'Successfully created finance record.',
    EDIT_FINANCE_RECORD: 'Edit Finance Record',
    EDIT_SUCCESS_TOAST: 'Successfully saved finance record.',
    SHOW_MODAL: 'Show save finance record modal.',
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
    RECORD: 'record',
    TOTAL_AMOUNT(args: { amount: number; type: FINANCE_RECORD_TYPE }) {
      let symbol = ''
      if (args.amount > 0 && args.type === 'Revenue') symbol = '+'
      if (args.amount > 0 && args.type === 'Expense') symbol = '-'

      return `${symbol}$${args.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
  },
} as const
