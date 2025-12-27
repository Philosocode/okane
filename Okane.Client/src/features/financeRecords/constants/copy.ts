// Internal
import { type FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

export const FINANCES_COPY = {
  CHARTS: {
    HEADING: 'Charts',
    TIME_INTERVAL: 'Time Interval',
  },

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

  SEARCH_FINANCE_RECORDS_MODAL: {
    APPLIED_SEARCH_FILTERS: 'Applied Search Filters',
    CUSTOM: 'Custom',
    EDIT_SEARCH_FILTERS: 'Edit Search Filters',
    HAPPENED_AFTER: 'Happened after',
    HAPPENED_BEFORE: 'Happened before',
    MAX_AMOUNT: 'Max amount',
    MIN_AMOUNT: 'Min amount',
    PAST_30_DAYS: 'Past 30 Days',
  },

  STATS: {
    EXPENSES: 'Expenses',
    EXPENSES_VS_REVENUES: 'Expenses VS Revenues',
    REVENUES: 'Revenues',
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
