// Internal
import { type SelectOption } from '@shared/components/form/FormSelect.vue'

export enum COMPARISON_OPERATOR {
  EQUAL = '=',
  GTE = '≥',
  LTE = '≤',
}

export const COMPARISON_OPERATOR_OPTION_MAP = {
  [COMPARISON_OPERATOR.EQUAL]: {
    value: COMPARISON_OPERATOR.EQUAL,
  },
  [COMPARISON_OPERATOR.GTE]: {
    value: COMPARISON_OPERATOR.GTE,
  },
  [COMPARISON_OPERATOR.LTE]: {
    value: COMPARISON_OPERATOR.LTE,
  },
} as const

export const ALL_COMPARISON_OPERATOR_OPTIONS = Object.values(COMPARISON_OPERATOR_OPTION_MAP)

export enum SORT_DIRECTION {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}

export const SORT_DIRECTION_OPTIONS: SelectOption[] = [
  {
    label: 'Ascending',
    value: SORT_DIRECTION.ASCENDING,
  },
  {
    label: 'Descending',
    value: SORT_DIRECTION.DESCENDING,
  },
]
