// Internal
import { ALL_COMPARISON_OPERATOR_OPTIONS, COMPARISON_OPERATOR } from '@shared/constants/search'

import { type MinMax } from '@shared/types/search'

export function convertValueAndOperatorToMinMax<TValue>(
  operator: COMPARISON_OPERATOR,
  value: TValue,
) {
  const results: MinMax<TValue> = { min: undefined, max: undefined }

  switch (operator) {
    case COMPARISON_OPERATOR.EQUAL:
      results.min = value
      results.max = value
      break
    case COMPARISON_OPERATOR.GTE:
      results.min = value
      break
    case COMPARISON_OPERATOR.LTE:
      results.max = value
      break
  }

  return results
}

export function isComparisonOperator(value: unknown): value is COMPARISON_OPERATOR {
  return ALL_COMPARISON_OPERATOR_OPTIONS.some((option) => option.value.toString() === value)
}
