// Internal
import { COMPARISON_OPERATOR } from '@shared/constants/search'

import { convertValueAndOperatorToMinMax } from '@shared/utils/search'

describe('convertValueAndOperatorToMinMax', () => {
  test('returns min & max equal for the EQUAL operator', () => {
    const result = convertValueAndOperatorToMinMax(COMPARISON_OPERATOR.EQUAL, 10)
    expect(result).toEqual({ min: 10, max: 10 })
  })

  test('returns only the min for the GTE operator', () => {
    const result = convertValueAndOperatorToMinMax(COMPARISON_OPERATOR.GTE, 10)
    expect(result).toEqual({ min: 10, max: undefined })
  })

  test('returns only the max for LTE operator', () => {
    const result = convertValueAndOperatorToMinMax(COMPARISON_OPERATOR.LTE, 10)
    expect(result).toEqual({ min: undefined, max: 10 })
  })
})
