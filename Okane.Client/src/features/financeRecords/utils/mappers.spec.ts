// External
import { endOfDay } from 'date-fns'

// Internal
import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'
import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import * as utils from '@features/financeRecords/utils/mappers'
import { mapDate } from '@shared/utils/dateTime'

import { createTestTag } from '@tests/factories/tag'
import {
  createTestFinanceRecord,
  createTestSaveFinanceRecordFormState,
} from '@tests/factories/financeRecord'

describe('mapFinanceRecord', () => {
  test('saveFinanceRecordFormState', () => {
    const financeRecord = createTestFinanceRecord()
    const result = utils.mapFinanceRecord.to.saveFinanceRecordFormState(financeRecord)
    expect(result).toEqual({
      ...financeRecord,
      happenedAt: mapDate.to.dateTimeLocal(financeRecord.happenedAt),
    })
  })
})

describe('mapSaveFinanceRecordFormState', () => {
  test('createFinanceRecordRequest', () => {
    const formState = createTestSaveFinanceRecordFormState()
    const result = utils.mapSaveFinanceRecordFormState.to.createFinanceRecordRequest(formState)
    expect(result).toEqual({
      ...result,
      happenedAt: new Date(formState.happenedAt),
    })
  })

  describe('partialFinanceRecord', () => {
    test('ignores happenedAt if undefined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        amount: 0,
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.partialFinanceRecord(changes)
      expect(result).toEqual(changes)
    })

    test('converts happenedAt to a date if defined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        amount: 0,
        happenedAt: '2018-06-12T19:30',
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.partialFinanceRecord(changes)
      expect(result).toEqual({
        amount: changes.amount,
        happenedAt: new Date(changes.happenedAt ?? 0),
        type: changes.type,
      })
    })
  })
})

describe('mapFinanceRecordsSearchFilters', () => {
  describe('URLSearchParams', () => {
    function getParams(overrides?: Partial<FinanceRecordsSearchFilters>) {
      const filters = {
        ...DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS,
        ...overrides,
      }
      return utils.mapFinanceRecordsSearchFilters.to.URLSearchParams(filters)
    }

    test('sortField and sortDirection', () => {
      const filters = DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS
      const params = getParams(filters)
      expect(params.get('sortDirection')).toBe(filters.sortDirection)
      expect(params.get('sortField')).toBe(filters.sortField)
    })

    test('does not include missing fields', () => {
      const params = getParams({ happenedAt1: undefined })
      const optionalFields = [
        'description',
        'happenedAfter',
        'happenedBefore',
        'minAmount',
        'maxAmount',
        'tagId',
        'type',
      ]

      optionalFields.forEach((field) => {
        expect(params.has(field)).toBe(false)
      })
    })

    test('description', () => {
      const filters = { description: 'Cool description' }
      const params = getParams(filters)
      expect(params.get('description')).toBe(filters.description)
    })

    test('tags', () => {
      const tags = [createTestTag({ id: 1 }), createTestTag({ id: 2 })]
      const filters = { tags }
      const params = getParams(filters)
      expect(params.getAll('tagId')).toEqual(['1', '2'])
    })

    test('type', () => {
      const filters = { type: FINANCE_RECORD_TYPE.REVENUE }
      const params = getParams(filters)
      expect(params.get('type')).toBe(filters.type)
    })

    describe('amount', () => {
      test('does not include an amount when amount1 is missing', () => {
        const filters = {
          amount1: undefined,
          amount2: 5,
          amountOperator: COMPARISON_OPERATOR.EQUAL,
        }
        const params = getParams(filters)
        expect(params.has('amount')).toBe(false)
      })

      test('does not include an amount when amountOperator is missing', () => {
        const filters = {
          amount1: 1,
          amount2: undefined,
          amountOperator: undefined,
        }
        const params = getParams(filters)
        expect(params.has('amount')).toBe(false)
      })

      test('includes minAmount when operator is ≥', () => {
        const filters = {
          amount1: 1,
          amount2: 5,
          amountOperator: COMPARISON_OPERATOR.GTE,
        }
        const params = getParams(filters)
        expect(params.get('minAmount')).toBe(filters.amount1.toString())
      })

      test('includes maxAmount when operator is ≤', () => {
        const filters = {
          amount1: 1,
          amount2: 5,
          amountOperator: COMPARISON_OPERATOR.LTE,
        }
        const params = getParams(filters)
        expect(params.get('maxAmount')).toBe(filters.amount1.toString())
      })

      test('includes minAmount and maxAmount when operator is =', () => {
        const filters = {
          amount1: 1,
          amount2: 5,
          amountOperator: COMPARISON_OPERATOR.EQUAL,
        }
        const params = getParams(filters)
        expect(params.get('minAmount')).toBe(filters.amount1.toString())
        expect(params.get('maxAmount')).toBe(filters.amount1.toString())
      })

      test('includes minAmount and maxAmount with a valid range', () => {
        const filters = {
          amount1: 1,
          amount2: 5,
          amountOperator: undefined,
        }
        const params = getParams(filters)
        expect(params.get('minAmount')).toBe(filters.amount1.toString())
        expect(params.get('maxAmount')).toBe(filters.amount2.toString())
      })
    })

    describe('happened at', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2025-01-01')

      test('does not include a happenedAt when happenedAt1 is missing', () => {
        const filters = {
          happenedAt1: undefined,
          happenedAt2: date2,
          happenedAtOperator: COMPARISON_OPERATOR.GTE,
        }
        const params = getParams(filters)
        expect(params.has('happenedAfter')).toBe(false)
        expect(params.has('happenedBefore')).toBe(false)
      })

      test('does not include a happenedAt when happenedAtOperator is missing', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: undefined,
          happenedAtOperator: undefined,
        }
        const params = getParams(filters)
        expect(params.has('happenedAfter')).toBe(false)
        expect(params.has('happenedBefore')).toBe(false)
      })

      test('includes happenedAfter when operator is ≥', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: date2,
          amountOperator: COMPARISON_OPERATOR.GTE,
        }
        const params = getParams(filters)
        expect(params.get('happenedAfter')).toBe(encodeURI(filters.happenedAt1.toISOString()))
      })

      test('includes happenedBefore when operator is ≤', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: date2,
          happenedAtOperator: COMPARISON_OPERATOR.LTE,
        }
        const params = getParams(filters)
        expect(params.get('happenedBefore')).toBe(
          encodeURI(endOfDay(filters.happenedAt1).toISOString()),
        )
      })

      test('includes happenedAfter and happenedBefore when operator is =', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: date2,
          happenedAtOperator: COMPARISON_OPERATOR.EQUAL,
        }
        const params = getParams(filters)
        expect(params.get('happenedAfter')).toBe(encodeURI(filters.happenedAt1.toISOString()))
        expect(params.get('happenedBefore')).toBe(
          encodeURI(endOfDay(filters.happenedAt1).toISOString()),
        )
      })

      test('includes happenedAfter and happenedBefore with a valid range', () => {
        const filters = {
          happenedAt1: date1,
          happenedAt2: date2,
          happenedAtOperator: undefined,
        }
        const params = getParams(filters)
        expect(params.get('happenedAfter')).toBe(encodeURI(filters.happenedAt1?.toISOString()))
        expect(params.get('happenedBefore')).toBe(
          encodeURI(endOfDay(filters.happenedAt2).toISOString()),
        )
      })
    })
  })
})
