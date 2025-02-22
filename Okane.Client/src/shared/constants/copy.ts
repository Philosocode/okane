export const SHARED_COPY = {
  ACTIONS: {
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    DISMISS: 'Dismiss',
    EDIT: 'Edit',
    RENAME: 'Rename',
    RESET: 'Reset',
    SAVE: 'Save',
    SWITCH_TO_DARK_MODE: 'Switch to Dark Mode',
    SWITCH_TO_LIGHT_MODE: 'Switch to Light Mode',
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
  COPYRIGHT: `© Tam Le ${new Date(Date.now()).getFullYear()}`,
  INFINITE_SCROLLER: {
    REACHED_THE_BOTTOM: "You've reached the bottom.",
  },
  MODAL: {
    CLOSE_BUTTON_TITLE: 'Close Modal',
  },
  NOUNS: {
    CITY: 'City',
    TAGS: 'Tags',
  },

  SEARCH: {
    OPERATOR: 'Operator',
    SORT_BY: 'Sort By',
    SORT_DIRECTION: 'Sort Direction',
    USE_RANGE: 'Use Range',
    USE_SINGLE: 'Use Single',
  },

  TAG_COMBOBOX: {
    LABEL: 'Tags',
    NO_OPTIONS: 'No tags created.',
    NO_RESULTS: 'No matching tags found.',
    PLACEHOLDER: 'Select tags...',
  },

  TIME_INTERVAL: {
    DAY: 'Day',
    LABEL: 'Time Interval',
    MONTH: 'Month',
    WEEK: 'Week',
    YEAR: 'Year',
  },

  TOGGLE_MENU: {
    BUTTON_TITLE: 'Toggle Menu',
  },
} as const
