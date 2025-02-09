// Internal
import { FINANCE_RECORD_TYPE_OPTIONS } from '@features/financeRecords/constants/saveFinanceRecord'

import * as utils from '@features/financeRecords/utils/financeRecord'

describe('isFinanceRecordType', () => {
  FINANCE_RECORD_TYPE_OPTIONS.forEach((option) => {
    test(`returns true if value is ${option.value}`, () => {
      expect(utils.isFinanceRecordType('Expense')).toBe(true)
    })
  })

  test('returns false with incorrect case', () => {
    expect(utils.isFinanceRecordType('expense')).toBe(false)
    expect(utils.isFinanceRecordType('revenue')).toBe(false)
  })

  test('returns false for other values', () => {
    expect(utils.isFinanceRecordType('')).toBe(false)
    expect(utils.isFinanceRecordType('hi')).toBe(false)
  })
})
