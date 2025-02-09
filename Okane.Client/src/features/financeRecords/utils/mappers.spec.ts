// External
import { endOfDay } from 'date-fns'

// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { COMPARISON_OPERATOR, SORT_DIRECTION } from '@shared/constants/search'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'
import {
  type FinanceRecordSearchFilters,
  type FinanceRecordSearchFiltersFormState,
} from '@features/financeRecords/types/searchFilters'

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
      amount: financeRecord.amount.toString(),
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
      amount: parseFloat(formState.amount),
      happenedAt: new Date(formState.happenedAt),
      tagIds: formState.tags.map((tag) => tag.id),
    })
  })

  describe('editFinanceRecordRequest', () => {
    test('ignores amount if undefined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual(changes)
    })

    test('converts amount to a number if defined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        amount: '1.23',
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual({ ...changes, amount: 1.23 })
    })

    test('ignores happenedAt if undefined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual(changes)
    })

    test('converts happenedAt to a date if defined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        happenedAt: '2018-06-12T19:30',
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual({
        happenedAt: new Date(changes.happenedAt ?? 0),
        type: changes.type,
      })
    })

    test('ignores tags if undefined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = { tags: undefined }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual(changes)
    })

    test('maps tagIds if tags is defined', () => {
      const tag = createTestTag()
      const changes: Partial<SaveFinanceRecordFormState> = { tags: [tag] }
      const result = utils.mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
      expect(result).toEqual({ tagIds: [tag.id] })
    })
  })
})

describe('mapFinanceRecordSearchFilters', () => {
  describe('financeRecordSearchFiltersFormState', () => {
    const getResult = utils.mapFinanceRecordSearchFilters.to.financeRecordSearchFiltersFormState

    test('converts empty values to empty strings', () => {
      const emptyFilters: FinanceRecordSearchFilters = {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        amount1: undefined,
        amount2: undefined,
        amountOperator: undefined,
        happenedAt1: undefined,
        happenedAt2: undefined,
        happenedAtOperator: undefined,
      }

      const formState = getResult(emptyFilters)
      expect(formState.amount1).toBe('')
      expect(formState.amount2).toBe('')
      expect(formState.amountOperator).toBe('')
      expect(formState.happenedAt1).toBe('')
      expect(formState.happenedAt2).toBe('')
      expect(formState.happenedAtOperator).toBe('')
    })

    test('converts amounts into strings', () => {
      const filters: FinanceRecordSearchFilters = {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        amount1: 1.1,
        amount2: 2.2,
      }

      const formState = getResult(filters)
      expect(formState.amount1).toBe('1.1')
      expect(formState.amount2).toBe('2.2')
    })

    test('converts dates into strings', () => {
      const filters: FinanceRecordSearchFilters = {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        happenedAt1: new Date('2025-01-01T10:10:10.000Z'),
        happenedAt2: new Date('2025-01-02T10:10:10.000Z'),
      }

      const formState = getResult(filters)
      expect(formState.happenedAt1).toBe('2025-01-01')
      expect(formState.happenedAt2).toBe('2025-01-02')
    })
  })

  describe('URLSearchParams', () => {
    function getParams(overrides?: Partial<FinanceRecordSearchFilters>) {
      const filters = {
        ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
        ...overrides,
      }
      return utils.mapFinanceRecordSearchFilters.to.URLSearchParams(filters)
    }

    test('sortField and sortDirection', () => {
      const filters = DEFAULT_FINANCE_RECORD_SEARCH_FILTERS
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

describe('mapFinanceRecordSearchFiltersFormState', () => {
  describe('financeRecordSearchFilters', () => {
    const getFilters = utils.mapFinanceRecordSearchFiltersFormState.to.financeRecordSearchFilters

    const emptyState: FinanceRecordSearchFiltersFormState = {
      happenedAt1: '',
      happenedAt2: '',
      amount1: '',
      amount2: '',
      amountOperator: '',
      description: '',
      happenedAtOperator: '',
      sortDirection: SORT_DIRECTION.ASCENDING,
      sortField: 'amount',
      tags: [],
      type: '',
    }

    test('sets empty values to undefined', () => {
      const filters = getFilters(emptyState)
      expect(filters.amount1).toBeUndefined()
      expect(filters.amount2).toBeUndefined()
      expect(filters.amountOperator).toBeUndefined()
      expect(filters.happenedAt1).toBeUndefined()
      expect(filters.happenedAt2).toBeUndefined()
      expect(filters.happenedAtOperator).toBeUndefined()
    })

    test('sets invalid values to undefined', () => {
      const formState = {
        ...emptyState,
        amount1: 'hi',
        amount2: 'a a a a',
        happenedAt1: 'I am not a date',
        happenedAt2: 'I am not a date',
      }

      const filters = getFilters(formState)
      expect(filters.amount1).toBeUndefined()
      expect(filters.amount2).toBeUndefined()
      expect(filters.happenedAt1).toBeUndefined()
      expect(filters.happenedAt2).toBeUndefined()
    })

    test('sets valid amounts', () => {
      const formState = {
        ...emptyState,
        amount1: '1.23',
        amount2: '5000000',
      }

      const filters = getFilters(formState)
      expect(filters.amount1).toBe(1.23)
      expect(filters.amount2).toBe(5_000_000)
    })

    test('sets valid happenedAt values', () => {
      const formState = {
        ...emptyState,
        happenedAt1: '2024-01-01',
        happenedAt2: '2024-02-02',
      }

      const filters = getFilters(formState)
      expect(filters.happenedAt1).toEqual(new Date('2024-01-01'))
      expect(filters.happenedAt2).toEqual(new Date('2024-02-02'))
    })
  })
})
