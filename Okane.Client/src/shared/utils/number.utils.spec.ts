// Internal
import * as numberUtils from '@/shared/utils/number.utils'

describe('isNumeric', () => {
  test.each([
    [41, true],
    [4.1, true],
    ['4', true],
    ['4.1', true],
    ['.12', true],
    ['hi there', false],
    ['1..', false],
    ['.', false],
    ['', false],
    [' ', false],
    [true, false],
    [false, false],
    [{}, false],
    [NaN, false],
  ])('isNumeric(%s) => %s', (actual, expected) => {
    expect(numberUtils.isNumeric(actual)).toBe(expected)
  })
})
