export const FINANCES_COPY = {
  FINANCES: 'Finances',

  DELETE_FINANCE_RECORD_MODAL: {
    ARE_YOU_SURE: 'Are you sure you want to delete this finance record?',
    DELETE_FINANCE_RECORD: 'Delete Finance Record',
  },

  INFINITE_LIST: {
    NO_FINANCE_RECORDS: "No finance records. Why don't you create one?",
  },

  PROPERTIES: {
    AMOUNT: 'Amount',
    DESCRIPTION: 'Description',
    HAPPENED_AT: 'Happened At',
    TYPE: 'Type',
  },

  // TODO: Pull fields from FIELDS.
  SAVE_FINANCE_RECORD_MODAL: {
    AMOUNT: 'Amount',
    CREATE_FINANCE_RECORD: 'Create Finance Record',
    DESCRIPTION: 'Description',
    EDIT_FINANCE_RECORD: 'Edit Finance Record',
    HAPPENED_AT: 'Happened At',
    SHOW_MODAL: 'Show save finance record modal.',
    TYPE: 'Type',
  },

  SEARCH_FINANCE_RECORDS_MODAL: {
    EDIT_SEARCH_FILTERS: 'Edit Search Filters',
    HAPPENED_AFTER: 'Happened after',
    HAPPENED_BEFORE: 'Happened before',
    MAX_AMOUNT: 'Max amount',
    MIN_AMOUNT: 'Min amount',
  },
} as const
