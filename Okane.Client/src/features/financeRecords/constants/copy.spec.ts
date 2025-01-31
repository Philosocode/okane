// Internal
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

describe('FINANCES_COPY.STATS.TOTAL_AMOUNT', () => {
  test('returns the expected value when amount is 0', () => {
    const result = FINANCES_COPY.STATS.TOTAL_AMOUNT({
      amount: 0,
      type: FINANCE_RECORD_TYPE.REVENUE,
    })
    expect(result).toBe('$0.00')
  })

  test('returns the expected value when type is expense', () => {
    const amount = 99999.9
    const result = FINANCES_COPY.STATS.TOTAL_AMOUNT({
      amount,
      type: FINANCE_RECORD_TYPE.EXPENSE,
    })
    expect(result).toBe('-$99,999.90')
  })

  test('returns the expected value when type is revenue', () => {
    const amount = 99999.9
    const result = FINANCES_COPY.STATS.TOTAL_AMOUNT({
      amount,
      type: FINANCE_RECORD_TYPE.REVENUE,
    })
    expect(result).toBe('+$99,999.90')
  })
})
