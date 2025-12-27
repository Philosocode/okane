// External
import { beforeEach, vi } from 'vitest'

// Internal
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SORT_FIELD_OPTIONS,
  HAPPENED_AT_TIMEFRAME,
  HAPPENED_AT_TIMEFRAME_OPTIONS,
} from '@features/financeRecords/constants/searchFilters'

import * as utils from '@features/financeRecords/utils/searchFilters'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'

describe('getFinanceRecordsSearchCursor', () => {
  const financeRecord = createTestFinanceRecord()

  test('returns an empty object when lastFinanceRecord is empty', () => {
    expect(utils.getFinanceRecordsSearchCursor(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)).toEqual({})
  })

  test('returns the expected cursor when sorting by amount', () => {
    const cursor = utils.getFinanceRecordsSearchCursor(
      {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        sortField: 'amount',
      },
      financeRecord,
    )
    expect(cursor).toEqual({ id: financeRecord.id, amount: financeRecord.amount })
  })

  test('returns the expected cursor when sorting by happenedAt', () => {
    const cursor = utils.getFinanceRecordsSearchCursor(
      {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        sortField: 'happenedAt',
      },
      financeRecord,
    )
    expect(cursor).toEqual({ id: financeRecord.id, happenedAt: financeRecord.happenedAt })
  })
})

describe('getHappenedAtTimeframeStartDate', () => {
  beforeEach(() => {
    const mockNow = new Date(2025, 10, 10).getTime()
    vi.spyOn(Date, 'now').mockReturnValue(mockNow)
  })

  test.each([
    { timeframe: HAPPENED_AT_TIMEFRAME.PAST_30_DAYS, expected: new Date(2025, 9, 11) },
    { timeframe: HAPPENED_AT_TIMEFRAME.THIS_MONTH, expected: new Date(2025, 10, 1) },
    { timeframe: HAPPENED_AT_TIMEFRAME.THIS_YEAR, expected: new Date(2025, 0, 1) },
    { timeframe: HAPPENED_AT_TIMEFRAME.CUSTOM, expected: undefined },
  ])('returns $expected for $timeframe', ({ timeframe, expected }) => {
    const result = utils.getHappenedAtTimeframeStartDate(timeframe)
    expect(result).toEqual(expected)
  })
})

describe('isFinanceRecordSortField', () => {
  FINANCE_RECORD_SORT_FIELD_OPTIONS.forEach((option) => {
    test(`returns true for ${option.value}`, () => {
      expect(utils.isFinanceRecordSortField(option.value)).toBe(true)
    })

    test('returns false for other values', () => {
      expect(utils.isFinanceRecordSortField('')).toBe(false)
      expect(utils.isFinanceRecordSortField('hi')).toBe(false)
    })
  })
})

describe('isHappenedAtTimeframe', () => {
  HAPPENED_AT_TIMEFRAME_OPTIONS.forEach((option) => {
    test(`returns true for ${option.value}`, () => {
      expect(utils.isHappenedAtTimeframe(option.value)).toBe(true)
    })

    test('returns false for other values', () => {
      expect(utils.isHappenedAtTimeframe('')).toBe(false)
      expect(utils.isHappenedAtTimeframe('hi')).toBe(false)
    })
  })
})
