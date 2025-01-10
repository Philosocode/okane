export const SHARED_COPY = {
  ACTIONS: {
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    EDIT: 'Edit',
    RESET: 'Reset',
    SAVE: 'Save',
  },
  COMPARISON: {
    EQUAL: {
      SYMBOL: '=',
      TEXT: 'Equal',
    },
    GREATER_THAN_EQUAL: {
      SYMBOL: '≥',
      TEXT: 'Greater than equal',
    },
    LESS_THAN_EQUAL: {
      SYMBOL: '≤',
      TEXT: 'Less than equal',
    },
  },
  COMMON: {
    ALL: 'all',
  },
  CONJUNCTIONS: {
    AND: 'and',
  },
  INFINITE_SCROLLER: {
    REACHED_THE_BOTTOM: "You've reached the bottom.",
  },
  MENU: {
    TOGGLE_MENU: 'Toggle Menu',
  },
  MODAL: {
    CLOSE_MODAL: 'Close Modal',
  },

  TAG_COMBOBOX: {
    LABEL: 'Tags',
    NO_OPTIONS: 'No tags created.',
    NO_RESULTS: 'No matching tags found.',
    PLACEHOLDER: 'Select tags...',
  },

  SEARCH: {
    OPERATOR: 'Operator',
    SORT_BY: 'Sort By',
    SORT_DIRECTION: 'Sort Direction',
    USE_RANGE: 'Use Range',
    USE_SINGLE: 'Use Single',
  },
} as const
