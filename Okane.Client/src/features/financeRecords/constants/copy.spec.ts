// External
import { format } from 'date-fns'

// Internal
import { COMMON_DATE_FORMAT } from '@shared/constants/dateTime'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'

import { createTestTag } from '@tests/factories/tag'

describe('FINANCES_COPY.MONEY', () => {
  test('returns the expected value when amount is 0', () => {
    const result = FINANCES_COPY.MONEY({
      amount: 0,
      type: FINANCE_RECORD_TYPE.REVENUE,
    })
    expect(result).toBe('$0.00')
  })

  test('returns the expected value when type is expense', () => {
    const amount = 99999.9
    const result = FINANCES_COPY.MONEY({
      amount,
      type: FINANCE_RECORD_TYPE.EXPENSE,
    })
    expect(result).toBe('-$99,999.90')
  })

  test('returns the expected value when type is revenue', () => {
    const amount = 99999.9
    const result = FINANCES_COPY.MONEY({
      amount,
      type: FINANCE_RECORD_TYPE.REVENUE,
    })
    expect(result).toBe('+$99,999.90')
  })
})

describe('FINANCES_COPY.SEARCH_FILTERS', () => {
  test('APPLIED_AMOUNT_AND_OPERATOR', () => {
    const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_AMOUNT_AND_OPERATOR({
      amount: 1.23,
      operator: COMPARISON_OPERATOR.GTE,
    })
    expect(result).toBe(`Amount ${COMPARISON_OPERATOR.GTE} $1.23`)
  })

  test('APPLIED_AMOUNT_RANGE', () => {
    const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_AMOUNT_RANGE({
      amount1: 1.23,
      amount2: 2,
    })
    expect(result).toBe(
      `Amount ${COMPARISON_OPERATOR.GTE} $1.23 and ${COMPARISON_OPERATOR.LTE} $2.00`,
    )
  })

  describe('APPLIED_HAPPENED_AT_AND_OPERATOR', () => {
    const date = new Date()
    const formattedDate = format(date, COMMON_DATE_FORMAT)

    test(`returns the expected text when operator is ${COMPARISON_OPERATOR.EQUAL}`, () => {
      const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_HAPPENED_AT_AND_OPERATOR({
        happenedAt: date,
        operator: COMPARISON_OPERATOR.EQUAL,
      })
      expect(result).toBe(`Happened at ${formattedDate}`)
    })

    test(`returns the expected text when operator is ${COMPARISON_OPERATOR.GTE}`, () => {
      const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_HAPPENED_AT_AND_OPERATOR({
        happenedAt: date,
        operator: COMPARISON_OPERATOR.GTE,
      })
      expect(result).toBe(`Happened on/after ${formattedDate}`)
    })

    test(`returns the expected text when operator is ${COMPARISON_OPERATOR.LTE}`, () => {
      const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_HAPPENED_AT_AND_OPERATOR({
        happenedAt: date,
        operator: COMPARISON_OPERATOR.LTE,
      })
      expect(result).toBe(`Happened on/before ${formattedDate}`)
    })
  })

  test('APPLIED_HAPPENED_AT_RANGE', () => {
    const date1 = new Date('2020-01-01')
    const formattedDate1 = format(date1, COMMON_DATE_FORMAT)
    const date2 = new Date('2021-01-01')
    const formattedDate2 = format(date2, COMMON_DATE_FORMAT)

    const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_HAPPENED_AT_RANGE({
      happenedAt1: date1,
      happenedAt2: date2,
    })
    expect(result).toBe(`Happened on/after ${formattedDate1} and on/before ${formattedDate2}`)
  })

  test('APPLIED_DESCRIPTION', () => {
    const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_DESCRIPTION({
      description: 'Hello world',
    })
    expect(result).toBe(`Description contains “Hello world”`)
  })

  describe('APPLIED_SORTING', () => {
    test('returns the expected text with ascending sort', () => {
      const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_SORTING({
        sortDirection: SORT_DIRECTION.ASCENDING,
        sortField: 'amount',
      })
      expect(result).toBe(`Sorting by “amount”, ascending`)
    })

    test('returns the expected text with descending sort', () => {
      const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_SORTING({
        sortDirection: SORT_DIRECTION.DESCENDING,
        sortField: 'amount',
      })
      expect(result).toBe(`Sorting by “amount”, descending`)
    })

    test('returns the expected text when sorting by happenedAt', () => {
      const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_SORTING({
        sortDirection: SORT_DIRECTION.ASCENDING,
        sortField: 'happenedAt',
      })
      expect(result).toBe(`Sorting by “happened at”, ascending`)
    })
  })

  describe('APPLIED_TAGS', () => {
    test('returns the expected text with one tag', () => {
      const tags = [createTestTag()]
      const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_TAGS({ tags })
      expect(result).toBe(`Contains at least one of these tags: ${tags[0].name}`)
    })

    test('returns the expected text with multiple tags', () => {
      const tags = [createTestTag(), createTestTag({ name: 'Tag 2' })]
      const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_TAGS({ tags })
      expect(result).toBe(`Contains at least one of these tags: ${tags[0].name}, ${tags[1].name}`)
    })
  })

  test('APPLIED_TYPE', () => {
    const result = FINANCES_COPY.SEARCH_FILTERS.APPLIED_TYPE({ type: FINANCE_RECORD_TYPE.EXPENSE })
    expect(result).toBe(`Type is ${FINANCE_RECORD_TYPE.EXPENSE}`)
  })
})
